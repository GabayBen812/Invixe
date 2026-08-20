const appJson = require("./app.json");

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
      entitlements: {
        "com.apple.developer.applesignin": ["Default"],
      },
      infoPlist: {
        CFBundleURLTypes: urlTypes,
      },
    },
    plugins,
    extra: {
      ...(appJson.expo.extra || {}),
      eas: {
        projectId: "2aa27cf5-52f2-4bc4-8cf3-47e92effed95",
      },
    },
  },
};
