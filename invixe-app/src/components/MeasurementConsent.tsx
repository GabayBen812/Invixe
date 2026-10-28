import { useEffect } from "react";
import { Alert, AppState, Linking } from "react-native";
import { TERMS_POLICY_URL } from "../config/externalLinks";
import {
  getMeasurementConsent,
  getMeasurementDiagnostics,
  isMetaMeasurementConfigured,
  refreshMeasurementConsent,
  setMeasurementConsent,
} from "../services/analytics/meta";

let showing = false;
export async function showMeasurementDiagnostics() {
  try {
    const status = await getMeasurementDiagnostics();
    Alert.alert("אבחון מדידה — גרסת בדיקה", JSON.stringify(status, null, 2), [{ text: "סגירה" }]);
  } catch {
    Alert.alert("אבחון מדידה", "לא ניתן לקרוא את מצב המדידה.");
  }
}

export function showMeasurementChoices() {
  if (showing || !isMetaMeasurementConfigured()) return;
  showing = true;
  const choose = (allowed: boolean) => {
    showing = false;
    void setMeasurementConsent(allowed);
  };
  Alert.alert(
    "מדידת יעילות הפרסום",
    "אפשר לשתף עם Meta מידע טכני ומזהי מכשיר לצורך שיוך פרסומות, וכן אירועי פתיחת האפליקציה, השלמת הרשמה ושיעורים. הבחירה אינה נדרשת לשימוש באפליקציה וניתן לשנות אותה בפרופיל. ב־iPhone נדרשת גם הרשאת מעקב בהגדרות המכשיר.",
    [
      { text: "לא מסכים/ה", onPress: () => choose(false) },
      { text: "מדיניות פרטיות", onPress: () => {
        showing = false;
        void Linking.openURL(TERMS_POLICY_URL).catch(() => {});
      } },
      { text: "מסכים/ה", onPress: () => choose(true) },
    ],
    { cancelable: false },
  );
}

export default function MeasurementConsent() {
  useEffect(() => {
    if (!isMetaMeasurementConfigured()) return;
    let mounted = true;
    const refresh = async () => {
      try {
        await refreshMeasurementConsent();
        if (mounted && AppState.currentState === "active" &&
            await getMeasurementConsent() === null) showMeasurementChoices();
      } catch { /* Measurement must not interrupt the app. */ }
    };
    void refresh();
    const listener = AppState.addEventListener("change", state => {
      if (state === "active") void refresh();
    });
    return () => { mounted = false; listener.remove(); };
  }, []);
  return null;
}
