const appJson = require("./app.json");

const metaEnabled = process.env.EXPO_PUBLIC_META_MEASUREMENT_ENABLED === "true";
const metaAppId = "1766622331291748";
const metaClientToken = process.env.META_CLIENT_TOKEN?.trim();
if (metaEnabled && !metaClientToken) {
  throw new Error("META_CLIENT_TOKEN is required when Meta measurement is enabled");
}

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
const googleReversedScheme = googleIosClientId?.endsWith(".apps.googleusercontent.com")
  ? `com.googleusercontent.apps.${googleIosClientId.replace(".apps.googleusercontent.com", "")}`
  : null;

const plugins = [...(appJson.expo.plugins || []), "expo-apple-authentication"];

if (googleReversedScheme) {
  plugins.push([
    "@react-native-google-signin/google-signin",
    { iosUrlScheme: googleReversedScheme },
  ]);
} else {
  plugins.push("@react-native-google-signin/google-signin");
}

{
  plugins.push(["react-native-fbsdk-next", {
    appID: metaAppId,
    clientToken: metaClientToken || "disabled-until-configured",
    displayName: "Invixe",
    scheme: `fb${metaAppId}`,
    advertiserIDCollectionEnabled: false,
    autoLogAppEventsEnabled: false,
    isAutoInitEnabled: false,
    iosUserTrackingPermission: false,
  }]);
  plugins.push(["expo-tracking-transparency", {
    userTrackingPermission: "הרשאה זו מאפשרת לשייך התקנות ופעילות באפליקציה לפרסומות של Invixe ולמדוד את יעילותן.",
  }]);
}

const urlTypes = [
  {
    CFBundleURLSchemes: [appJson.expo.ios?.bundleIdentifier || "com.gabayben812.invixeapp"],
  },
];
if (googleReversedScheme) {
  urlTypes.push({ CFBundleURLSchemes: [googleReversedScheme] });
}

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...(appJson.expo.ios || {}),
      supportsTablet: true,
      requireFullScreen: true,
      entitlements: {
        "com.apple.developer.applesignin": ["Default"],
      },
      infoPlist: {
        ...(appJson.expo.ios?.infoPlist || {}),
        UIDeviceFamily: [1, 2],
        UIRequiresFullScreen: true,
        "UISupportedInterfaceOrientations~ipad": [
          "UIInterfaceOrientationPortrait",
          "UIInterfaceOrientationPortraitUpsideDown",
        ],
        CFBundleURLTypes: urlTypes,
      },
    },
    plugins,
    extra: {
      ...(appJson.expo.extra || {}),
      metaMeasurementEnabled: metaEnabled,
      eas: {
        projectId: "2aa27cf5-52f2-4bc4-8cf3-47e92effed95",
      },
    },
  },
};
