import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";

const BEAR = "#E15637";

/** Gravestone doji: open/close at the low, long upper wick. */
const GravestoneDoji = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={100} height={180} viewBox="0 0 100 180" fill="none" {...props}>
      <Rect x={47} y={14} width={6} height={126} fill={BEAR} rx={3} />
      <Rect x={20} y={140} width={60} height={14} fill={BEAR} rx={4} />
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

export default GravestoneDoji;
