import { Alert } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";

export const GUEST_DISCLAIMER =
  "לא מומלץ — ההתקדמות לא נשמרת וחלק מהתכונות חסומות.";

export function alertGuestFeatureBlocked(
  feature: string,
  navigation?: NativeStackNavigationProp<RootStackParamList>,
) {
  Alert.alert(
    "נדרש חשבון",
    `${feature} זמין רק למשתמשים רשומים. צור חשבון כדי לשמור התקדמות, לסחור ולפתוח פרופיל.`,
    navigation
      ? [
          { text: "ביטול", style: "cancel" },
          {
            text: "הירשם / התחבר",
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: "Login" }] }),
          },
        ]
      : [{ text: "הבנתי", style: "default" }],
  );
}

export function navigateProfileOrGuestGate(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  isGuest: boolean,
) {
  if (isGuest) {
    navigation.navigate("Profile");
    return;
  }
  navigation.navigate("Profile");
}
