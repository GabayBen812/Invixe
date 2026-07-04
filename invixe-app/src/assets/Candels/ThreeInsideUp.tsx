import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";

const BULL = "#4CAF50";
const BEAR = "#E15637";

const ThreeInsideUp = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={160} height={184} viewBox="0 0 160 184" fill="none" {...props}>
      {/* Candle 1: large bearish */}
      <Rect x={24} y={12} width={4} height={16} fill={BEAR} rx={2} />
      <Rect x={11} y={28} width={30} height={124} fill={BEAR} rx={4} />
      <Rect x={24} y={152} width={4} height={14} fill={BEAR} rx={2} />

      {/* Candle 2: small bullish inside candle 1 range */}
      <Rect x={77} y={58} width={4} height={16} fill={BULL} rx={2} />
      <Rect x={64} y={74} width={30} height={48} fill={BULL} rx={4} />
      <Rect x={77} y={122} width={4} height={14} fill={BULL} rx={2} />

      {/* Candle 3: large bullish closing above candle 1 open */}
      <Rect x={130} y={10} width={4} height={16} fill={BULL} rx={2} />
      <Rect x={117} y={26} width={30} height={110} fill={BULL} rx={4} />
      <Rect x={130} y={136} width={4} height={18} fill={BULL} rx={2} />
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

export default ThreeInsideUp;
