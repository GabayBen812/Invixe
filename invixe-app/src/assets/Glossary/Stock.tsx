import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";

const GOLD = "#F59E0B";
const GOLD_LIGHT = "#FEF3C7";
const REST = "#E2E8F0";
const BORDER = "#D1D5DB";

const Stock = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Outer donut circle (rest = neutral) */}
      <Circle cx={100} cy={82} r={62} fill={REST} />

      {/* Owned wedge (~35% of the circle, highlighted in gold) */}
      {/* Start at top of circle (100, 20), sweep clockwise ~126° to end at ~(147, 115) */}
      <Path
        d="M100,82 L100,20 A62,62 0 0,1 147,112 Z"
        fill={GOLD}
      />

      {/* Inner circle (donut hole) */}
      <Circle cx={100} cy={82} r={35} fill="white" />

      {/* Small gold accent in center */}
      <Circle cx={100} cy={82} r={16} fill={GOLD} fillOpacity={0.25} />
      <Circle cx={100} cy={82} r={8} fill={GOLD} fillOpacity={0.6} />

      {/* Outer border */}
      <Circle cx={100} cy={82} r={62} fill="none" stroke={BORDER} strokeWidth={2} />
      <Circle cx={100} cy={82} r={35} fill="none" stroke={BORDER} strokeWidth={1.5} />
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

export default Stock;
