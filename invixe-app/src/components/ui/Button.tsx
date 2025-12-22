import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  style?: any;
}

export default function Button({
  text,
  onPress,
  variant = "primary",
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary"
          ? styles.primary
          : variant === "danger"
          ? styles.danger
          : styles.secondary,
        style,
      ]}
      onPress={onPress}
    >
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginVertical: 8,
    minWidth: 220,
    alignItems: "center",
  },
  primary: { backgroundColor: "#3372D8" },
  secondary: { backgroundColor: "#12B76A" },
  danger: { backgroundColor: "#f44336" },
  text: { color: "white", fontSize: 20, fontWeight: "bold" },
});
