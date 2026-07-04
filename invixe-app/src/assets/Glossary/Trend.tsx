import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";

const LINE = "#3372D8";
const GRID = "#E2E8F0";
const DOT = "#3372D8";

const Trend = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Grid lines */}
      <Rect x={15} y={130} width={175} height={1.5} fill={GRID} />
      <Rect x={15} y={95} width={175} height={1} fill={GRID} />
      <Rect x={15} y={60} width={175} height={1} fill={GRID} />
      <Rect x={15} y={25} width={175} height={1} fill={GRID} />

      {/* Uptrend line — higher highs and higher lows */}
      <Path
        d="M18,125 L50,78 L72,96 L105,50 L128,66 L162,22 L185,40"
        stroke={LINE}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Highlight higher highs */}
      <Circle cx={50} cy={78} r={5} fill={DOT} />
      <Circle cx={105} cy={50} r={5} fill={DOT} />
      <Circle cx={162} cy={22} r={5} fill={DOT} />

      {/* Arrow at end */}
      <Path
        d="M185,40 L178,53 L191,52 Z"
        fill={LINE}
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 9.35,
    elevation: 5,
  },
});

export default Trend;
