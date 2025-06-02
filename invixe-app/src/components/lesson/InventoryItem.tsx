import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface InventoryItemProps {
  label: string;
  count: number;
}

export default function InventoryItem({ label, count }: InventoryItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    minWidth: 60,
  },
  count: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e355e",
  },
  label: {
    fontSize: 14,
    color: "#1e355e",
  },
});
