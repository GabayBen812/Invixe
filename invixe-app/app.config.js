const appJson = require("./app.json");

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
const plugins = [...(appJson.expo.plugins || []), "expo-apple-authentication"];

if (googleIosClientId?.endsWith(".apps.googleusercontent.com")) {
  const clientPrefix = googleIosClientId.replace(".apps.googleusercontent.com", "");
  plugins.push([
    "@react-native-google-signin/google-signin",
    {
      iosUrlScheme: `com.googleusercontent.apps.${clientPrefix}`,
    },
  ]);
} else {
  plugins.push("@react-native-google-signin/google-signin");
}

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...(appJson.expo.ios || {}),
      entitlements: {
        "com.apple.developer.applesignin": ["Default"],
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
