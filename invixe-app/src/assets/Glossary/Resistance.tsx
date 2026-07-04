import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";

const LINE = "#3372D8";
const RESIST = "#E15637";
const GRID = "#E2E8F0";

const Resistance = (props: any) => (
  <View style={styles.shadow}>
    <Svg width={200} height={160} viewBox="0 0 200 160" fill="none" {...props}>
      {/* Axis */}
      <Rect x={15} y={135} width={175} height={1.5} fill={GRID} />

      {/* Resistance line (dashed) */}
      <Rect x={15} y={52} width={18} height={3} fill={RESIST} rx={1.5} />
      <Rect x={41} y={52} width={18} height={3} fill={RESIST} rx={1.5} />
      <Rect x={67} y={52} width={18} height={3} fill={RESIST} rx={1.5} />
      <Rect x={93} y={52} width={18} height={3} fill={RESIST} rx={1.5} />
      <Rect x={119} y={52} width={18} height={3} fill={RESIST} rx={1.5} />
      <Rect x={145} y={52} width={18} height={3} fill={RESIST} rx={1.5} />
      <Rect x={171} y={52} width={18} height={3} fill={RESIST} rx={1.5} />

      {/* Price path bouncing off resistance */}
      <Path
        d="M18,128 L48,58 L72,90 L105,58 L132,88 L162,58 L188,100"
        stroke={LINE}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Touch points at resistance */}
      <Circle cx={48} cy={58} r={5} fill={RESIST} />
      <Circle cx={105} cy={58} r={5} fill={RESIST} />
      <Circle cx={162} cy={58} r={5} fill={RESIST} />
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

export default Resistance;
