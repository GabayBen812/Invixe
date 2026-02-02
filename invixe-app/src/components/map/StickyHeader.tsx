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
        <Text style={styles.stickyTitle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <View style={styles.stickyBadge}>
          <Text style={styles.stickyBadgeText}>📈</Text>
        </View>
      </View>
      <View style={styles.stickyHeaderRight}>
        <Text style={styles.stickyProgress}>{Math.round(progress * 100)}%</Text>
        <View style={styles.miniProgressBar}>
          <ProgressBar
            progress={progress}
            width={Math.min(60, SCREEN_WIDTH * 0.2)}
          />
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
    width: "100%",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    // shadowColor: theme.colors.black,
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.08,
    // shadowRadius: 4,
    elevation: 3,
    // backgroundColor: theme.colors.primaryBlue,
  },
  stickyHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  stickyBadge: {
    backgroundColor: theme.colors.trustBlueLight,
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  stickyBadgeText: {
    fontSize: 16,
  },
  stickyTitle: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    flex: 1,
  },
  stickyHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  stickyProgress: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: theme.colors.primaryBlue,
    marginRight: theme.spacing.sm,
    minWidth: 40,
    textAlign: "right",
  },
  miniProgressBar: {
    alignItems: "center",
  },
});
