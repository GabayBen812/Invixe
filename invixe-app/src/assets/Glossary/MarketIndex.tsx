import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const BAR = "#8B5CF6";
const BAR_LIGHT = "#C4B5FD";
const LINE = "#6D28D9";
const AXIS = "#E2E8F0";

const Index = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Axis */}
      <Rect x={18} y={130} width={168} height={2} fill={AXIS} />

      {/* Bars representing individual assets */}
      <Rect x={22} y={58} width={24} height={72} fill={BAR_LIGHT} rx={4} />
      <Rect x={56} y={75} width={24} height={55} fill={BAR_LIGHT} rx={4} />
      <Rect x={90} y={38} width={24} height={92} fill={BAR} rx={4} />
      <Rect x={124} y={65} width={24} height={65} fill={BAR_LIGHT} rx={4} />
      <Rect x={158} y={82} width={24} height={48} fill={BAR_LIGHT} rx={4} />

      {/* Index line connecting weighted average (above the bars) */}
      <Path
        d="M34,52 L68,68 L102,32 L136,58 L170,75"
        stroke={LINE}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8 4"
      />
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

export default Index;
