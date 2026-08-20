import { Platform } from "react-native";

/**
 * OAuth client IDs — set via .env locally or EAS secrets for builds:
 * EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
 * EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
 * EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID (optional on Android if SHA-1 + web client configured)
 */
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || "";

export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || "";

export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || "";

export const APPLE_BUNDLE_ID = "com.gabayben812.invixeapp";

export function isGoogleAuthConfigured(): boolean {
  if (!GOOGLE_WEB_CLIENT_ID) return false;
  if (Platform.OS === "ios" && !GOOGLE_IOS_CLIENT_ID) return false;
  return true;
}

/** Reversed iOS client ID — required as a URL scheme for Google Sign-In on iOS. */
export function googleIosReversedClientId(): string | undefined {
  if (!GOOGLE_IOS_CLIENT_ID.endsWith(".apps.googleusercontent.com")) {
    return undefined;
  }
  const clientPrefix = GOOGLE_IOS_CLIENT_ID.replace(
    ".apps.googleusercontent.com",
    "",
  );
  return `com.googleusercontent.apps.${clientPrefix}`;
}
