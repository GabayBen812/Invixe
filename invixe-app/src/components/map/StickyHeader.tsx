import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import theme from "../../theme";
import ProgressBar from "./ProgressBar";

const SCREEN_WIDTH = Dimensions.get("window").width;

type StickyHeaderProps = {
  title: string;
  progress: number;
};

export default function StickyHeader({ title, progress }: StickyHeaderProps) {
  return (
    <View style={styles.stickyHeaderContent}>
      <View style={styles.stickyHeaderLeft}>
        <View style={styles.stickyBadge}>
          <Text style={styles.stickyBadgeText}>📈</Text>
        </View>
        <Text style={styles.stickyTitle}>{title}</Text>
      </View>
      <View style={styles.stickyHeaderRight}>
        <Text style={styles.stickyProgress}>{Math.round(progress * 100)}%</Text>
        <View style={styles.miniProgressBar}>
          <ProgressBar progress={progress} width={Math.min(60, SCREEN_WIDTH * 0.2)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stickyHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stickyBadge: {
    backgroundColor: "#EFF6FF",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  stickyBadgeText: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: "#0EA5E9",
  },
  stickyTitle: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: "#1E293B",
    letterSpacing: -0.2,
  },
  stickyHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  stickyProgress: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: "#0EA5E9",
    marginRight: 8,
    minWidth: 35,
    textAlign: "right",
  },
  miniProgressBar: {
    alignItems: "center",
  },
});


