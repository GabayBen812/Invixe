import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as AppleAuthentication from "expo-apple-authentication";
import { API_BASE_URL } from "../config/api";
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  isGoogleAuthConfigured,
} from "../config/auth";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

export type SocialAuthResult = {
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  isNewUser?: boolean;
  needsOnboarding?: boolean;
};

type GoogleSignInModule = typeof import("@react-native-google-signin/google-signin");

let googleModuleCache: GoogleSignInModule | null | undefined;
let googleConfigured = false;

const NATIVE_MODULE_MISSING =
  "Google Sign-In requires a native build. Run: npm run ios (or npm run android). Expo Go is not supported.";

export function isExpoGo(): boolean {
  return (
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}

async function loadGoogleSignInModule(): Promise<GoogleSignInModule | null> {
  if (googleModuleCache !== undefined) {
    return googleModuleCache;
  }

  if (isExpoGo()) {
    googleModuleCache = null;
    return null;
  }

  try {
    googleModuleCache = await import("@react-native-google-signin/google-signin");
    return googleModuleCache;
  } catch {
    googleModuleCache = null;
    return null;
  }
}

export async function isGoogleSignInAvailable(): Promise<boolean> {
  if (!isGoogleAuthConfigured()) return false;
  if (isExpoGo()) return false;
  const mod = await loadGoogleSignInModule();
  return mod !== null;
}

async function ensureGoogleConfigured(
  GoogleSignin: GoogleSignInModule["GoogleSignin"],
) {
  if (googleConfigured) return;
  if (!isGoogleAuthConfigured()) {
    throw new Error("Google Sign-In is not configured");
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    ...(GOOGLE_ANDROID_CLIENT_ID
      ? { androidClientId: GOOGLE_ANDROID_CLIENT_ID }
      : {}),
    offlineAccess: false,
  });
  googleConfigured = true;
}

async function exchangeSocialToken(
  provider: "google" | "apple",
  body: Record<string, unknown>,
): Promise<SocialAuthResult> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/auth/${provider}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : `${provider} authentication failed`,
    );
  }

  return {
    phone: data.phone,
    firstName: data.firstName,
    lastName: data.lastName,
    isNewUser: Boolean(data.isNewUser),
    needsOnboarding: Boolean(data.needsOnboarding),
  };
}

export async function signInWithGoogle(): Promise<SocialAuthResult> {
  if (isExpoGo()) {
    throw new Error(NATIVE_MODULE_MISSING);
  }

  const google = await loadGoogleSignInModule();
  if (!google) {
    throw new Error(NATIVE_MODULE_MISSING);
  }

  const { GoogleSignin, isSuccessResponse } = google;
  await ensureGoogleConfigured(GoogleSignin);

  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    throw new Error("SIGN_IN_CANCELLED");
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Google did not return an ID token");
  }

  return exchangeSocialToken("google", { idToken });
}

export async function signInWithApple(): Promise<SocialAuthResult> {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Sign-In is only available on iOS");
  }

  if (isExpoGo()) {
    throw new Error(
      "Apple Sign-In requires a native build. Run: npm run ios. Expo Go is not supported.",
    );
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error("Apple Sign-In is not available on this device");
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error("Apple did not return an identity token");
  }

  return exchangeSocialToken("apple", {
    identityToken: credential.identityToken,
    firstName: credential.fullName?.givenName || undefined,
    lastName: credential.fullName?.familyName || undefined,
  });
}

export function getSocialAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("native build") || error.message.includes("Expo Go")) {
      return "התחברות Google/Apple דורשת build מקומי — הרץ npm run ios מהתיקייה invixe-app";
    }
    if (error.message.includes("not configured")) {
      return "התחברות Google עדיין לא הוגדרה — הוסף Client ID לקובץ .env";
    }
    if (error.message.includes("Google auth is not configured")) {
      return "שרת ההתחברות לא מוגדר — פנה למנהל המערכת";
    }
    if (
      error.message === "SIGN_IN_CANCELLED" ||
      error.message.includes("ERR_REQUEST_CANCELED") ||
      error.message.toLowerCase().includes("cancel")
    ) {
      return "";
    }
  }

  const maybeCode = error as { code?: string };
  if (maybeCode?.code === "SIGN_IN_CANCELLED") {
    return "";
  }
  if (maybeCode?.code === "PLAY_SERVICES_NOT_AVAILABLE") {
    return "Google Play Services לא זמין במכשיר";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "שגיאה בהתחברות";
}

export function shouldShowAppleSignIn(): boolean {
  return Platform.OS === "ios";
}
