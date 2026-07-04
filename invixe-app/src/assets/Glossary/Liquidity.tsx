import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Path } from "react-native-svg";

const BUY = "#4CAF50";
const SELL = "#E15637";
const MID = "#3372D8";
const GRID = "#E2E8F0";

const Liquidity = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Center price column */}
      <Rect x={97} y={15} width={6} height={130} fill={MID} rx={3} />

      {/* Buy orders (left, green) — varying widths */}
      <Rect x={40} y={22} width={55} height={18} fill={BUY} fillOpacity={0.85} rx={4} />
      <Rect x={24} y={46} width={71} height={18} fill={BUY} fillOpacity={0.75} rx={4} />
      <Rect x={12} y={70} width={83} height={18} fill={BUY} fillOpacity={0.65} rx={4} />
      <Rect x={30} y={94} width={65} height={18} fill={BUY} fillOpacity={0.75} rx={4} />
      <Rect x={50} y={118} width={45} height={18} fill={BUY} fillOpacity={0.85} rx={4} />

      {/* Sell orders (right, red) — varying widths */}
      <Rect x={103} y={22} width={52} height={18} fill={SELL} fillOpacity={0.85} rx={4} />
      <Rect x={103} y={46} width={68} height={18} fill={SELL} fillOpacity={0.75} rx={4} />
      <Rect x={103} y={70} width={80} height={18} fill={SELL} fillOpacity={0.65} rx={4} />
      <Rect x={103} y={94} width={60} height={18} fill={SELL} fillOpacity={0.75} rx={4} />
      <Rect x={103} y={118} width={42} height={18} fill={SELL} fillOpacity={0.85} rx={4} />
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

export default Liquidity;
