import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";

const STAR = "#94A3B8";

/** Classic doji: thin body with balanced upper and lower wicks. */
const Doji = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={100} height={180} viewBox="0 0 100 180" fill="none" {...props}>
      <Rect x={47} y={18} width={6} height={66} fill={STAR} rx={3} />
      <Rect x={20} y={84} width={60} height={12} fill={STAR} rx={4} />
      <Rect x={47} y={96} width={6} height={66} fill={STAR} rx={3} />
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

export default Doji;
