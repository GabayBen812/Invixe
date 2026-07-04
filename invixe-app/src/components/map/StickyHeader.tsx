import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import theme from "../../theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PROGRESS_BAR_WIDTH = Math.min(80, SCREEN_WIDTH * 0.21);

type StickyHeaderProps = {
  title: string;
  progress: number;
};

const MiniChartIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 17l5-5 4 3 5-7 4 4"
      stroke={theme.colors.primary[400]}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function StickyHeader({ title, progress }: StickyHeaderProps) {
  const pct = Math.round(Math.max(0, Math.min(1, progress || 0)) * 100);
  const fillWidth = Math.max(0, Math.min(1, progress || 0)) * PROGRESS_BAR_WIDTH;

  return (
    <View style={styles.container}>
      {/* LEFT: progress section (RTL: visual left = reading end) */}
      <View style={styles.progressSection}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: fillWidth }]} />
        </View>
        <Text style={styles.percentText}>{pct}%</Text>
      </View>

      {/* RIGHT: title + icon badge (RTL: visual right = reading start) */}
      <View style={styles.titleSection}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <View style={styles.iconBadge}>
          <MiniChartIcon />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexShrink: 0,
  },
  barTrack: {
    width: PROGRESS_BAR_WIDTH,
    height: 5,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: theme.colors.primary[400],
    borderRadius: 3,
  },
  percentText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[400],
    minWidth: 30,
    textAlign: "left",
  },
  titleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[900],
    flex: 1,
    textAlign: "right",
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: theme.colors.trustBlueLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
