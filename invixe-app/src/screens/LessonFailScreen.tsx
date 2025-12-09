import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Button from "../components/ui/Button";
import theme from "../theme";

// Sad face SVG or emoji
const SadIcon = () => (
  <Text style={{ fontSize: 40, marginBottom: 12 }}>😢</Text>
);

type Props = NativeStackScreenProps<RootStackParamList, "LessonFail">;

export default function LessonFailScreen({ navigation }: Props) {
  const handleContinue = () => {
    navigation.navigate("Map");
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E3EEF9' }}>
      <View style={styles.container}>
        <SadIcon />
        <Text style={styles.title}>אוי לא...</Text>
        <Text style={styles.subtitle}>לא הצלחת בשיעור הפעם</Text>
        <Text style={styles.subtitleSmall}>נסה שוב כדי להצליח!</Text>
        <Button text="חזור למפה" onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.font.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
    fontFamily: theme.font.family,
  },
  subtitleSmall: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
    fontFamily: theme.font.family,
  },
}); 