import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const BEAR = "#E15637";
const GRID = "#E2E8F0";

const BearMarket = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Axis */}
      <Rect x={15} y={135} width={175} height={1.5} fill={GRID} />

      {/* Falling market fill */}
      <Path
        d="M18,20 L48,40 L78,58 L108,78 L138,100 L168,120 L188,132 L188,135 L18,135 Z"
        fill={BEAR}
        fillOpacity={0.1}
      />

      {/* Falling market line */}
      <Path
        d="M18,20 L48,40 L78,58 L108,78 L138,100 L168,120 L188,132"
        stroke={BEAR}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Large downward arrow at end */}
      <Path
        d="M178,142 L188,132 L168,132 Z"
        fill={BEAR}
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

export default BearMarket;
