import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  text: string;
  color?: string;
  children?: React.ReactNode;
}

export default function PlaceholderBackground({
  text,
  color = "#1e355e",
  children,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.text}>{text}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    top: 40,
  },
});
