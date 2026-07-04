import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";

const BEFORE = "#64748B";
const AFTER = "#4CAF50";
const RESIST = "#E15637";
const GRID = "#E2E8F0";

const Breakout = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Axis */}
      <Rect x={15} y={135} width={175} height={1.5} fill={GRID} />

      {/* Previous resistance line (dashed) */}
      <Rect x={15} y={75} width={16} height={3} fill={RESIST} rx={1.5} />
      <Rect x={38} y={75} width={16} height={3} fill={RESIST} rx={1.5} />
      <Rect x={61} y={75} width={16} height={3} fill={RESIST} rx={1.5} />
      <Rect x={84} y={75} width={16} height={3} fill={RESIST} rx={1.5} />
      <Rect x={107} y={75} width={16} height={3} fill={RESIST} rx={1.5} />
      {/* Line extends after breakout (now support) */}
      <Rect x={130} y={75} width={16} height={3} fill={AFTER} fillOpacity={0.4} rx={1.5} />
      <Rect x={153} y={75} width={16} height={3} fill={AFTER} fillOpacity={0.4} rx={1.5} />
      <Rect x={176} y={75} width={16} height={3} fill={AFTER} fillOpacity={0.4} rx={1.5} />

      {/* Price path before breakout */}
      <Path
        d="M18,125 L45,80 L68,92 L90,80 L108,78"
        stroke={BEFORE}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Breakout continuation (green) */}
      <Path
        d="M108,78 L130,42 L155,22 L185,10"
        stroke={AFTER}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Breakout point */}
      <Circle cx={108} cy={78} r={6} fill={AFTER} />

      {/* Arrow at end */}
      <Path
        d="M185,10 L177,24 L191,22 Z"
        fill={AFTER}
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

export default Breakout;
