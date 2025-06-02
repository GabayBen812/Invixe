import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../ui/Button";

interface LessonNodeProps {
  title: string;
  description: string;
  unlocked: boolean;
  onStart: () => void;
  showConnector?: boolean;
}

export default function LessonNode({
  title,
  description,
  unlocked,
  onStart,
  showConnector,
}: LessonNodeProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.node,
          unlocked ? styles.nodeUnlocked : styles.nodeLocked,
        ]}
      >
        <Text style={styles.nodeText}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {unlocked ? (
          <Button
            text="התחל"
            variant="primary"
            onPress={onStart}
            style={styles.startBtn}
          />
        ) : (
          <Text style={styles.lockedText}>🔒</Text>
        )}
      </View>
      {showConnector && <View style={styles.connector} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  node: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
  },
  nodeUnlocked: {
    borderColor: "#4caf50",
    borderWidth: 2,
  },
  nodeLocked: {
    borderColor: "#aaa",
    borderWidth: 2,
    opacity: 0.6,
  },
  nodeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e355e",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  startBtn: {
    marginVertical: 0,
    minWidth: 160,
  },
  lockedText: {
    fontSize: 22,
    color: "#aaa",
    marginTop: 4,
  },
  connector: {
    width: 4,
    height: 32,
    backgroundColor: "#4caf50",
    marginBottom: 8,
  },
});
