import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";

const LINE = "#3372D8";
const SUPP = "#12B76A";
const GRID = "#E2E8F0";

const Support = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Axis */}
      <Rect x={15} y={135} width={175} height={1.5} fill={GRID} />

      {/* Support line (dashed) */}
      <Rect x={15} y={112} width={18} height={3} fill={SUPP} rx={1.5} />
      <Rect x={41} y={112} width={18} height={3} fill={SUPP} rx={1.5} />
      <Rect x={67} y={112} width={18} height={3} fill={SUPP} rx={1.5} />
      <Rect x={93} y={112} width={18} height={3} fill={SUPP} rx={1.5} />
      <Rect x={119} y={112} width={18} height={3} fill={SUPP} rx={1.5} />
      <Rect x={145} y={112} width={18} height={3} fill={SUPP} rx={1.5} />
      <Rect x={171} y={112} width={18} height={3} fill={SUPP} rx={1.5} />

      {/* Price path bouncing off support */}
      <Path
        d="M18,38 L48,108 L72,65 L102,108 L128,58 L158,108 L185,45"
        stroke={LINE}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Touch points at support */}
      <Circle cx={48} cy={108} r={5} fill={SUPP} />
      <Circle cx={102} cy={108} r={5} fill={SUPP} />
      <Circle cx={158} cy={108} r={5} fill={SUPP} />
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

export default Support;
