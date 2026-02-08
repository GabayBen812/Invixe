import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import PageBackground from "../../components/ui/PageBackground";
import Button from "../../components/ui/Button";
import theme from "../../theme";
import { useUser } from "../../context/UserContext";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { setCurrentUser } = useUser();
  return (
    <PageBackground source={require("../../assets/DefaultBlankBackground.png")}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>בוא נבנה לך מסלול אישי</Text>
          <Text style={styles.subtitle}>
            נבין מה ידע שלך, מה המטרה שלך בשוק ההון ונרכיב עבורך מסלול לימוד
            שמתאים בדיוק אליך.
          </Text>

          <View style={styles.row}>
            <View style={styles.textCol}>
              <Text style={styles.bullet}>• הגדרת רמת ניסיון</Text>
              <Text style={styles.bullet}>• בחירת מטרות לימוד</Text>
              <Text style={styles.bullet}>• התאמת קורסים ותרגולים</Text>
            </View>
            <Image
              source={require("../../assets/Characters/character_orange_noback.png")}
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
            style={{ marginTop: theme.spacing.sm }}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: theme.spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    color: "#3372D8",
    textAlign: "right",
    fontFamily: theme.font.bold,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: "#5E7686",
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
    fontSize: 14,
    color: "#0F2233",
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
