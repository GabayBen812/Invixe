import React from "react";
import { View, Text, StyleSheet } from "react-native";
import InventoryItem from "./InventoryItem";

interface InventoryProps {
  inventory: {
    logs?: number;
    bread?: number;
    wine?: number;
    oranges?: number;
  };
}

export default function Inventory({ inventory }: InventoryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>מה יש ברשותך:</Text>
        <View style={styles.grid}>
          {inventory.logs !== undefined && (
            <InventoryItem label="גזעים" count={inventory.logs} />
          )}
          {inventory.bread !== undefined && (
            <InventoryItem label="לחם" count={inventory.bread} />
          )}
          {inventory.wine !== undefined && (
            <InventoryItem label="יין" count={inventory.wine} />
          )}
          {inventory.oranges !== undefined && (
            <InventoryItem label="תפוזים" count={inventory.oranges} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    width: "100%",
    alignItems: "center",
  },
  box: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 16,
    width: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e355e",
    textAlign: "center",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
});
