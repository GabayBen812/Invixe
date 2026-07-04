import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const RSI_LINE = "#8B5CF6";
const OB_BG = "#FEE2E2";
const OS_BG = "#DCFCE7";
const OB_DASH = "#E15637";
const OS_DASH = "#4CAF50";
const GRID = "#E2E8F0";

const RSI = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Overbought zone background */}
      <Rect x={15} y={15} width={172} height={35} fill={OB_BG} rx={4} />
      {/* Oversold zone background */}
      <Rect x={15} y={110} width={172} height={35} fill={OS_BG} rx={4} />

      {/* Axis line */}
      <Rect x={15} y={148} width={172} height={1.5} fill={GRID} />

      {/* Overbought line (dashed) at y=50 */}
      <Rect x={15} y={50} width={14} height={2.5} fill={OB_DASH} rx={1} />
      <Rect x={36} y={50} width={14} height={2.5} fill={OB_DASH} rx={1} />
      <Rect x={57} y={50} width={14} height={2.5} fill={OB_DASH} rx={1} />
      <Rect x={78} y={50} width={14} height={2.5} fill={OB_DASH} rx={1} />
      <Rect x={99} y={50} width={14} height={2.5} fill={OB_DASH} rx={1} />
      <Rect x={120} y={50} width={14} height={2.5} fill={OB_DASH} rx={1} />
      <Rect x={141} y={50} width={14} height={2.5} fill={OB_DASH} rx={1} />
      <Rect x={162} y={50} width={14} height={2.5} fill={OB_DASH} rx={1} />

      {/* Oversold line (dashed) at y=110 */}
      <Rect x={15} y={110} width={14} height={2.5} fill={OS_DASH} rx={1} />
      <Rect x={36} y={110} width={14} height={2.5} fill={OS_DASH} rx={1} />
      <Rect x={57} y={110} width={14} height={2.5} fill={OS_DASH} rx={1} />
      <Rect x={78} y={110} width={14} height={2.5} fill={OS_DASH} rx={1} />
      <Rect x={99} y={110} width={14} height={2.5} fill={OS_DASH} rx={1} />
      <Rect x={120} y={110} width={14} height={2.5} fill={OS_DASH} rx={1} />
      <Rect x={141} y={110} width={14} height={2.5} fill={OS_DASH} rx={1} />
      <Rect x={162} y={110} width={14} height={2.5} fill={OS_DASH} rx={1} />

      {/* RSI oscillator line */}
      <Path
        d="M18,78 L38,30 L62,48 L85,115 L108,122 L128,88 L150,32 L170,48 L188,78"
        stroke={RSI_LINE}
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

export default RSI;
