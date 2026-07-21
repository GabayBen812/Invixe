import { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useRegistration } from "../../../context/RegistrationContext";
import { useUser } from "../../context/UserContext";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import theme from "../../theme";
import { API_BASE_URL } from "../../config/api";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";

const API_URL = `${API_BASE_URL}/register`;
const TOTAL_STEPS = 3;

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingFinish">;

export default function OnboardingFinishScreen({ navigation }: Props) {
  const { data, reset } = useRegistration();
  const { setCurrentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithTimeout(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Registration failed");

      const resBody = await res.json().catch(() => ({}));
      await setCurrentUser(data.phone, {
        firstName: resBody.firstName ?? data.firstName,
        lastName: resBody.lastName ?? data.lastName,
      });

      setSuccess(true);
      reset();
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell
      step={3}
      totalSteps={TOTAL_STEPS}
      eyebrow="סיימנו כמעט"
      title={success ? "הכל מוכן!" : "מוכן להתחיל?"}
      subtitle={
        success
          ? "נרשמת בהצלחה. בוא ניכנס למפה ונתחיל ללמוד."
          : "נשמור את ההעדפות שלך וניצור את החשבון."
      }
      onBack={success ? undefined : () => navigation.navigate("GoalSelect")}
      ctaLabel={success ? "התחל ללמוד" : loading ? "יוצרים חשבון..." : "סיים והרשם"}
      ctaDisabled={loading}
      onCta={() => {
        if (success) {
          navigation.reset({ index: 0, routes: [{ name: "Map", params: {} }] });
          return;
        }
        if (!loading) handleRegister();
      }}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>סיכום קצר</Text>
        <View style={styles.row}>
          <Text style={styles.rowValue}>{data.ageGroup || "—"}</Text>
          <Text style={styles.rowLabel}>גיל</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowValue}>{data.goal || "—"}</Text>
          <Text style={styles.rowLabel}>מטרה</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowValue}>
            {[data.firstName, data.lastName].filter(Boolean).join(" ") || "—"}
          </Text>
          <Text style={styles.rowLabel}>שם</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary[500]}
          style={{ marginTop: 12 }}
        />
      ) : null}
      {!!error && <Text style={styles.error}>{error}</Text>}
      {success ? (
        <Pressable
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: "Map", params: {} }] })
          }
        >
          <Text style={styles.successHint}>אפשר גם ללחוץ כאן כדי להיכנס למפה</Text>
        </Pressable>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontFamily: theme.font.bold,
    fontSize: 16,
    color: theme.colors.neutral[900],
    textAlign: "right",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontFamily: theme.font.family,
    fontSize: 14,
    color: theme.colors.neutral[500],
  },
  rowValue: {
    flex: 1,
    fontFamily: theme.font.bold,
    fontSize: 15,
    color: theme.colors.neutral[900],
    textAlign: "left",
  },
  error: {
    color: theme.colors.error[600],
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    fontFamily: theme.font.family,
  },
  successHint: {
    marginTop: 10,
    textAlign: "center",
    color: theme.colors.primary[500],
    fontFamily: theme.font.bold,
    fontSize: 14,
  },
});
