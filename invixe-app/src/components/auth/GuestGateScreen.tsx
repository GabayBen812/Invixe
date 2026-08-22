import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import theme from "../../theme";
import { GUEST_DISCLAIMER } from "../../utils/guestMode";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onExitGuest: () => void;
};

export default function GuestGateScreen({ navigation, onExitGuest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>מצב אורח</Text>
      <Text style={styles.body}>
        בפרופיל אפשר לראות התקדמות, תיק השקעות, סטטיסטיקות ועוד — רק עם
        חשבון רשום.
      </Text>
      <Text style={styles.disclaimer}>{GUEST_DISCLAIMER}</Text>

      <Pressable
        style={styles.primaryBtn}
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: "Login" }] })
        }
      >
        <Text style={styles.primaryBtnText}>הירשם / התחבר</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={onExitGuest}>
        <Text style={styles.secondaryBtnText}>יציאה ממצב אורח</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: "#0F2233",
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: theme.font.family,
    color: "#475569",
    textAlign: "center",
    marginBottom: 10,
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: theme.font.bold,
    color: "#B45309",
    textAlign: "center",
    marginBottom: 28,
  },
  primaryBtn: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: theme.colors.primaryBlue,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: "#64748B",
  },
});
