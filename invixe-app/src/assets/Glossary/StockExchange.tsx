import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Path } from "react-native-svg";

const BULL = "#4CAF50";
const BEAR = "#E15637";
const COLUMN = "#F59E0B";
const COL_LIGHT = "#FEF3C7";
const GRID = "#E2E8F0";

const StockExchange = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Floor / base */}
      <Rect x={10} y={138} width={180} height={6} fill={COLUMN} rx={3} />

      {/* Columns */}
      <Rect x={22} y={30} width={12} height={110} fill={COL_LIGHT} rx={2} />
      <Rect x={60} y={30} width={12} height={110} fill={COL_LIGHT} rx={2} />
      <Rect x={98} y={30} width={12} height={110} fill={COL_LIGHT} rx={2} />
      <Rect x={136} y={30} width={12} height={110} fill={COL_LIGHT} rx={2} />
      <Rect x={166} y={30} width={12} height={110} fill={COL_LIGHT} rx={2} />

      {/* Pediment / roof */}
      <Path
        d="M10,30 L100,10 L190,30 Z"
        fill={COLUMN}
      />
      <Rect x={10} y={28} width={180} height={5} fill={COLUMN} rx={2} />

      {/* Mini candles inside to represent trading */}
      <Rect x={35} y={82} width={14} height={38} fill={BULL} rx={2} />
      <Rect x={41} y={72} width={2} height={10} fill={BULL} rx={1} />
      <Rect x={41} y={120} width={2} height={10} fill={BULL} rx={1} />

      <Rect x={75} y={68} width={14} height={48} fill={BEAR} rx={2} />
      <Rect x={81} y={58} width={2} height={10} fill={BEAR} rx={1} />
      <Rect x={81} y={116} width={2} height={12} fill={BEAR} rx={1} />

      <Rect x={115} y={78} width={14} height={42} fill={BULL} rx={2} />
      <Rect x={121} y={68} width={2} height={10} fill={BULL} rx={1} />
      <Rect x={121} y={120} width={2} height={10} fill={BULL} rx={1} />

      <Rect x={148} y={72} width={14} height={52} fill={BEAR} rx={2} />
      <Rect x={154} y={60} width={2} height={12} fill={BEAR} rx={1} />
      <Rect x={154} y={124} width={2} height={8} fill={BEAR} rx={1} />
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

export default StockExchange;
