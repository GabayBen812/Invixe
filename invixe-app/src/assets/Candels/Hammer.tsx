import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";

const BULL = "#4CAF50";

/** Bullish hammer: small body near the top, long lower wick. */
const Hammer = ({ color = BULL, ...props }: any) => (
  <View style={styles.shadow}>
    <Svg width={100} height={180} viewBox="0 0 100 180" fill="none" {...props}>
      <Rect x={47} y={18} width={6} height={14} fill={color} rx={3} />
      <Rect x={28} y={32} width={44} height={36} fill={color} rx={6} />
      <Rect x={47} y={68} width={6} height={94} fill={color} rx={3} />
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

export default Hammer;
