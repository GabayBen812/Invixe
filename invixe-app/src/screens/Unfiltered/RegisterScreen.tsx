import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import PageBackground from "../../components/ui/PageBackground";
import Button from "../../components/ui/Button";
import theme from "../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  return (
    <PageBackground source={require("../../assets/bg.png")}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>בוא נבנה לך מסלול אישי</Text>
          <Text style={styles.subtitle}>
            נבין מה הידע שלך, מה המטרה שלך בשוק ההון ונרכיב עבורך מסלול לימוד
            שמתאים בדיוק אליך.
          </Text>

          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={styles.bullet}>• הגדרת רמת ניסיון</Text>
              <Text style={styles.bullet}>• בחירת מטרות לימוד</Text>
              <Text style={styles.bullet}>• התאמת קורסים ותרגולים</Text>
            </View>
            <Image
              source={require("../../assets/character-bubble.png")}
              style={styles.sideImage}
            />
          </View>

          <Button
            text="התחל הרשמה"
            onPress={() => navigation.navigate("OnboardingIntro")}
          />
          <Button
            text="חזרה למסך הראשי"
            variant="secondary"
            onPress={() => navigation.navigate("Welcome")}
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      </View>
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    shadowColor: theme.colors.trustBlueDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    color: theme.colors.primaryBlue,
    textAlign: "right",
    fontFamily: theme.font.bold,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: "right",
    lineHeight: 22,
    fontFamily: theme.font.family,
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  textCol: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  bullet: {
    fontSize: 15,
    color: theme.colors.trustBlueDark,
    textAlign: "right",
    marginBottom: theme.spacing.xs,
    fontFamily: theme.font.family,
  },
  sideImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },
});
