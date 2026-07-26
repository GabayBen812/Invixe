/**
 * OAuth client IDs — set via .env or EAS secrets:
 * EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
 * EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
 */
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || "";

export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || "";

export const APPLE_BUNDLE_ID = "com.gabayben812.invixeapp";

export function isGoogleAuthConfigured(): boolean {
  return GOOGLE_WEB_CLIENT_ID.length > 0;
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
