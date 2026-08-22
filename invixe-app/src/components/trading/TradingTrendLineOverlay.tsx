import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { TREND_LINE_COLOR } from "./TradingTrendLineToggle";

export type TrendPixelLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type TrendPixelPoint = {
  x: number;
  y: number;
};

type Props = {
  enabled: boolean;
  lines: TrendPixelLine[];
  pendingDot: TrendPixelPoint | null;
  onTap: (x: number, y: number) => void;
};

export default function TradingTrendLineOverlay({
  enabled,
  lines,
  pendingDot,
  onTap,
}: Props) {
  if (!enabled) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Svg style={styles.svg} pointerEvents="none">
        {lines.map((line, index) => (
          <Line
            key={`trend-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={TREND_LINE_COLOR}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        {pendingDot ? (
          <Circle
            cx={pendingDot.x}
            cy={pendingDot.y}
            r={5}
            fill={TREND_LINE_COLOR}
          />
        ) : null}
      </Svg>
      <Pressable
        style={styles.capture}
        onPress={(event) => {
          onTap(event.nativeEvent.locationX, event.nativeEvent.locationY);
        }}
        accessibilityRole="button"
        accessibilityLabel="צייר קו מגמה"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    elevation: 4,
  },
  svg: {
    ...StyleSheet.absoluteFillObject,
  },
  capture: {
    ...StyleSheet.absoluteFillObject,
  },
});
