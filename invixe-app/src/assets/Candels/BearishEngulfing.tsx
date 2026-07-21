import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";

const BULL = "#4CAF50";
const BEAR = "#E15637";

/** Bearish engulfing: small bullish candle fully covered by a large bearish one. */
const BearishEngulfing = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={160} height={184} viewBox="0 0 160 184" fill="none" {...props}>
      {/* Candle 1: small bullish */}
      <Rect x={40} y={48} width={4} height={14} fill={BULL} rx={2} />
      <Rect x={28} y={62} width={28} height={56} fill={BULL} rx={4} />
      <Rect x={40} y={118} width={4} height={14} fill={BULL} rx={2} />

      {/* Candle 2: large bearish engulfing */}
      <Rect x={114} y={18} width={4} height={16} fill={BEAR} rx={2} />
      <Rect x={98} y={34} width={36} height={120} fill={BEAR} rx={4} />
      <Rect x={114} y={154} width={4} height={16} fill={BEAR} rx={2} />
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

export default BearishEngulfing;
