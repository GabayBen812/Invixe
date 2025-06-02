import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SpeechBubbleProps {
  message: string;
}

export default function SpeechBubble({ message }: SpeechBubbleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    maxWidth: 320,
    width: "80%",
  },
  text: {
    fontSize: 22,
    color: "#1e355e",
    textAlign: "center",
    fontWeight: "bold",
  },
});
