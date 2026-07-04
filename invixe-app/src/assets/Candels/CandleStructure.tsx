import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";

const BULL = "#4CAF50";

const CandleStructure = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={100} height={180} viewBox="0 0 100 180" fill="none" {...props}>
      {/* Top wick */}
      <Rect x={47} y={8} width={6} height={34} fill={BULL} rx={3} />
      {/* Body */}
      <Rect x={20} y={42} width={60} height={96} fill={BULL} rx={6} />
      {/* Bottom wick */}
      <Rect x={47} y={138} width={6} height={34} fill={BULL} rx={3} />
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

export default CandleStructure;
