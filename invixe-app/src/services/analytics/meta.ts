import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

const CONSENT_KEY = "invixe.metaMeasurementConsent.v1";
type SDK = typeof import("react-native-fbsdk-next");
let sdk: SDK | undefined;
let active = false;
let queue: Promise<unknown> = Promise.resolve();

export function isMetaMeasurementConfigured(): boolean {
  return Constants.expoConfig?.extra?.metaMeasurementEnabled === true &&
    Platform.OS !== "web" &&
    Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

export async function getMeasurementConsent(): Promise<boolean | null> {
  const value = await AsyncStorage.getItem(CONSENT_KEY);
  return value === null ? null : value === "yes";
}

// Serialize consent changes and events. Never replay events collected before consent.
function serialize<T>(operation: () => Promise<T>): Promise<T | undefined> {
  const task = queue.then(operation).catch(() => {
    active = false;
    try {
      sdk?.Settings.setAutoLogAppEventsEnabled(false);
      sdk?.Settings.setAdvertiserIDCollectionEnabled(false);
    } catch { /* A missing native module must not crash the app. */ }
    if (__DEV__) console.warn("Meta measurement unavailable; app operation continues.");
    return undefined;
  });
  queue = task;
  return task;
}

async function applyConsent(allowed: boolean, requestPermission: boolean) {
  active = false;
  if (!isMetaMeasurementConfigured()) return;
  if (allowed && Platform.OS === "ios") {
    const tracking = await import("expo-tracking-transparency");
    let permission = await tracking.getTrackingPermissionsAsync();
    if (requestPermission && permission.status === "undetermined") {
      permission = await tracking.requestTrackingPermissionsAsync();
    }
    allowed = permission.status === "granted";
  }
  // Do not even load/initialize Meta for someone who has never opted in.
  if (!allowed && !sdk) return;
  sdk ??= await import("react-native-fbsdk-next");
  sdk.Settings.setAutoLogAppEventsEnabled(false);
  sdk.Settings.setAdvertiserIDCollectionEnabled(allowed);
  if (Platform.OS === "ios") {
    await sdk.Settings.setAdvertiserTrackingEnabled(allowed);
  }
  if (!allowed) return;
  sdk.Settings.setAutoLogAppEventsEnabled(true);
  sdk.Settings.initializeSDK();
  active = true;
}

export function refreshMeasurementConsent() {
  return serialize(async () => applyConsent(await getMeasurementConsent() === true, false));
}

export function setMeasurementConsent(allowed: boolean) {
  // Immediately close the event gate, including while persistence/native updates run.
  active = false;
  return serialize(async () => {
    // Stop native collection even if persisting a revocation fails.
    if (!allowed) await applyConsent(false, false);
    await AsyncStorage.setItem(CONSENT_KEY, allowed ? "yes" : "no");
    if (allowed) await applyConsent(true, true);
  });
}

function logEvent(name: "fb_mobile_complete_registration" | "invixe_lesson_completed") {
  if (!active) return;
  void serialize(async () => {
    if (!active || !sdk) return;
    // Recheck ATT in case the user changed the OS permission outside the app.
    if (Platform.OS === "ios") {
      const tracking = await import("expo-tracking-transparency");
      if ((await tracking.getTrackingPermissionsAsync()).status !== "granted") {
        await applyConsent(false, false);
        return;
      }
    }
    sdk.AppEventsLogger.logEvent(name);
  });
}

export const trackRegistrationCompleted = () => logEvent("fb_mobile_complete_registration");
export const trackLessonCompleted = () => logEvent("invixe_lesson_completed");
