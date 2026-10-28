import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

const CONSENT_KEY = "invixe.metaMeasurementConsent.v1";
type SDK = typeof import("react-native-fbsdk-next");
let sdk: SDK | undefined;
let active = false;
let queue: Promise<unknown> = Promise.resolve();
let lastEvent: string | null = null;
let lastEventState = "none";
let failureStage: string | null = null;
let stage = "idle";
type NativeStatus = {
  appIDMatches: boolean; clientTokenPresent: boolean; autoLogEnabled: boolean;
  advertiserIDEnabled: boolean; trackingAuthorized: boolean; lastErrorCode: string;
};
type Lifecycle = {
  activateAfterConsent(): Promise<boolean>;
  getStatus(): Promise<NativeStatus>;
};
let lifecycle: Lifecycle | undefined;

async function getLifecycle() {
  const { requireNativeModule } = await import("expo-modules-core");
  return lifecycle ??= requireNativeModule<Lifecycle>("InvixeMeta");
}

export function isMetaMeasurementConfigured(): boolean {
  // Expo embeds this value in the JS bundle. Native manifest availability must
  // not decide whether the consent controls exist in a standalone build.
  return process.env.EXPO_PUBLIC_META_MEASUREMENT_ENABLED === "true" &&
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
    failureStage = stage;
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
  stage = "consent";
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
  stage = "native-settings";
  sdk.Settings.setAutoLogAppEventsEnabled(false);
  sdk.Settings.setAdvertiserIDCollectionEnabled(allowed);
  if (Platform.OS === "ios") {
    await sdk.Settings.setAdvertiserTrackingEnabled(allowed);
  }
  if (!allowed) return;
  sdk.Settings.setAutoLogAppEventsEnabled(true);
  sdk.Settings.initializeSDK();
  if (Platform.OS === "ios") {
    // Await a method on the same legacy native queue before calling the Expo
    // module. Otherwise its activation can race the fire-and-forget setters.
    await sdk.Settings.getAdvertiserTrackingEnabled();
    stage = "activate-session";
    if (!await (await getLifecycle()).activateAfterConsent()) {
      failureStage = "native-consent-gate";
      return;
    }
  }
  active = true;
  failureStage = null;
  stage = "ready";
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
  lastEvent = name;
  lastEventState = "blocked";
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
    stage = "log-event";
    sdk.AppEventsLogger.logEvent(name);
    // These events are infrequent. Flush now so closing the app immediately
    // after a lesson does not leave delivery waiting for the SDK's timer.
    sdk.AppEventsLogger.flush();
    lastEventState = "handed-to-sdk";
    stage = "ready";
  });
}

// Local diagnostics only. No tokens, identifiers, account data or lesson contents.
// Handed-to-sdk is deliberately NOT described as confirmed server delivery.
export async function getMeasurementDiagnostics() {
  await queue;
  const consent = await getMeasurementConsent();
  const permission = Platform.OS === "ios"
    ? (await (await import("expo-tracking-transparency")).getTrackingPermissionsAsync()).status
    : "not-required";
  let native: NativeStatus | null = null;
  if (Platform.OS === "ios" && sdk) {
    try { native = await (await getLifecycle()).getStatus(); }
    catch { failureStage ??= "native-diagnostics"; }
  }
  return { configured: isMetaMeasurementConfigured(), consent, permission, active,
    lastEvent, lastEventState, failureStage, native };
}

export const trackRegistrationCompleted = () => logEvent("fb_mobile_complete_registration");
export const trackLessonCompleted = () => logEvent("invixe_lesson_completed");
