import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  /** >0 ascending (green), <=0 flatter. Shape stays stock-like either way. */
  trend?: number;
};

// Normalized y-from-top values (0 = top, 1 = bottom). Jagged, generally rising.
const SHAPE = [
  0.58, 0.52, 0.63, 0.47, 0.54, 0.44, 0.5, 0.36, 0.43, 0.3, 0.37, 0.24, 0.3,
  0.16, 0.22, 0.1,
];

export default function PortfolioSparkline({
  width = 300,
  height = 96,
  trend = 0.7,
}: Props) {
  const { line, area, endX, endY } = useMemo(() => {
    const padX = 6;
    const padTop = 12;
    const padBottom = 10;
    const w = width - padX * 2;
    const h = height - padTop - padBottom;
    const n = SHAPE.length;

    // Lower trend → flatter line (less vertical spread).
    const spread = Math.max(0.35, Math.min(1, 0.5 + trend * 0.5));
    const midline = 0.45;

    const coords = SHAPE.map((v, i) => {
      const adjusted = midline + (v - midline) * spread;
      const x = padX + (i / (n - 1)) * w;
      const y = padTop + adjusted * h;
      return { x, y };
    });

    let linePath = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
    coords.slice(1).forEach((c) => {
      linePath += ` L ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
    });

    const last = coords[n - 1];
    const first = coords[0];
    const areaPath = `${linePath} L ${last.x.toFixed(2)} ${height} L ${first.x.toFixed(
      2,
    )} ${height} Z`;

    return { line: linePath, area: areaPath, endX: last.x, endY: last.y };
  }, [width, height, trend]);

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#62D24C" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#62D24C" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#9BE38A" />
            <Stop offset="100%" stopColor="#37B24D" />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#sparkFill)" />
        <Path
          d={line}
          stroke="url(#sparkLine)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={endX} cy={endY} r={5} fill="#37B24D" />
        <Circle cx={endX} cy={endY} r={9} fill="#37B24D" fillOpacity={0.18} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    marginVertical: 6,
  },
});
