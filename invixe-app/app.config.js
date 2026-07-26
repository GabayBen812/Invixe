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
    plugins,
  },
};
