import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const LINE = "#3372D8";
const GRID = "#E2E8F0";

const LineChart = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Grid */}
      <Rect x={18} y={130} width={170} height={1.5} fill={GRID} />
      <Rect x={18} y={100} width={170} height={1} fill={GRID} />
      <Rect x={18} y={70} width={170} height={1} fill={GRID} />
      <Rect x={18} y={40} width={170} height={1} fill={GRID} />
      <Rect x={18} y={15} width={1} height={120} fill={GRID} />
      <Rect x={65} y={15} width={1} height={120} fill={GRID} />
      <Rect x={112} y={15} width={1} height={120} fill={GRID} />
      <Rect x={160} y={15} width={1} height={120} fill={GRID} />

      {/* Chart fill */}
      <Path
        d="M18,120 L40,110 L65,88 L88,80 L112,88 L135,55 L160,48 L188,25 L188,130 L18,130 Z"
        fill={LINE}
        fillOpacity={0.12}
      />
      {/* Chart line */}
      <Path
        d="M18,120 L40,110 L65,88 L88,80 L112,88 L135,55 L160,48 L188,25"
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

export default LineChart;
