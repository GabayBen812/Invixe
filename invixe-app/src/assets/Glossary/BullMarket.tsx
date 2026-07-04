import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const BULL = "#4CAF50";
const FILL = "#4CAF50";
const GRID = "#E2E8F0";

const BullMarket = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Axis */}
      <Rect x={15} y={135} width={175} height={1.5} fill={GRID} />

      {/* Rising market fill */}
      <Path
        d="M18,128 L48,108 L78,90 L108,70 L138,48 L168,28 L188,18 L188,135 L18,135 Z"
        fill={FILL}
        fillOpacity={0.12}
      />

      {/* Rising market line */}
      <Path
        d="M18,128 L48,108 L78,90 L108,70 L138,48 L168,28 L188,18"
        stroke={BULL}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Large upward arrow at end */}
      <Path
        d="M178,8 L188,18 L168,18 Z"
        fill={BULL}
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

export default BullMarket;
