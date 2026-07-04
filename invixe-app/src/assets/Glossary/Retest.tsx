import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";

const LINE = "#3372D8";
const LEVEL = "#12B76A";
const RETEST_DOT = "#F59E0B";
const GRID = "#E2E8F0";

const Retest = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Axis */}
      <Rect x={15} y={138} width={175} height={1.5} fill={GRID} />

      {/* Key level line (dashed green) */}
      <Rect x={15} y={80} width={15} height={3} fill={LEVEL} rx={1.5} />
      <Rect x={37} y={80} width={15} height={3} fill={LEVEL} rx={1.5} />
      <Rect x={59} y={80} width={15} height={3} fill={LEVEL} rx={1.5} />
      <Rect x={81} y={80} width={15} height={3} fill={LEVEL} rx={1.5} />
      <Rect x={103} y={80} width={15} height={3} fill={LEVEL} rx={1.5} />
      <Rect x={125} y={80} width={15} height={3} fill={LEVEL} rx={1.5} />
      <Rect x={147} y={80} width={15} height={3} fill={LEVEL} rx={1.5} />
      <Rect x={169} y={80} width={15} height={3} fill={LEVEL} rx={1.5} />

      {/* Price path: breakout → rise → retest level → continue up */}
      <Path
        d="M18,130 L55,82 L72,40 L95,82 L118,80 L148,30 L185,15"
        stroke={LINE}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Breakout point */}
      <Circle cx={55} cy={82} r={5} fill={LEVEL} />

      {/* Retest point (highlighted in gold) */}
      <Circle cx={108} cy={80} r={7} fill={RETEST_DOT} />
      <Circle cx={108} cy={80} r={4} fill="white" />

      {/* Arrow at end */}
      <Path
        d="M185,15 L178,28 L191,27 Z"
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

export default Retest;
