import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const LINE = "#3372D8";
const GRID = "#E2E8F0";
const FILL = "#3372D8";

const PriceMovement = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Axis */}
      <Rect x={15} y={130} width={175} height={1.5} fill={GRID} />

      {/* Volatile price path with fill below */}
      <Path
        d="M18,100 L35,68 L55,108 L72,55 L90,85 L110,38 L130,72 L150,48 L170,80 L188,42 L188,130 L18,130 Z"
        fill={FILL}
        fillOpacity={0.1}
      />
      <Path
        d="M18,100 L35,68 L55,108 L72,55 L90,85 L110,38 L130,72 L150,48 L170,80 L188,42"
        stroke={LINE}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
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

export default PriceMovement;
