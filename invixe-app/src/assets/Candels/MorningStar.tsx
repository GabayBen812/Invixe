import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";

const BULL = "#4CAF50";
const BEAR = "#E15637";
const STAR = "#94A3B8";

const MorningStar = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={160} height={184} viewBox="0 0 160 184" fill="none" {...props}>
      {/* Candle 1: large bearish */}
      <Rect x={24} y={10} width={4} height={20} fill={BEAR} rx={2} />
      <Rect x={11} y={30} width={30} height={112} fill={BEAR} rx={4} />
      <Rect x={24} y={142} width={4} height={16} fill={BEAR} rx={2} />

      {/* Candle 2: tiny star (doji) below candle 1, gapped down */}
      <Rect x={77} y={148} width={4} height={8} fill={STAR} rx={2} />
      <Rect x={64} y={156} width={30} height={10} fill={STAR} rx={3} />
      <Rect x={77} y={166} width={4} height={8} fill={STAR} rx={2} />

      {/* Candle 3: large bullish confirmation */}
      <Rect x={130} y={10} width={4} height={22} fill={BULL} rx={2} />
      <Rect x={117} y={32} width={30} height={106} fill={BULL} rx={4} />
      <Rect x={130} y={138} width={4} height={18} fill={BULL} rx={2} />
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

export default MorningStar;
