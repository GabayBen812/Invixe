import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  /** Raw portfolio values over time (oldest → newest). */
  values?: number[];
};

function buildPaths(
  values: number[],
  width: number,
  height: number,
) {
  const padX = 6;
  const padTop = 12;
  const padBottom = 10;
  const w = width - padX * 2;
  const h = height - padTop - padBottom;
  const n = values.length;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const rawSpan = max - min;
  const padding = rawSpan > 0 ? rawSpan * 0.06 : Math.max(max * 0.015, 1);
  const paddedMin = min - padding;
  const paddedMax = max + padding;
  const span = paddedMax - paddedMin || 1;

  const coords = values.map((v, i) => {
    const x = padX + (i / Math.max(n - 1, 1)) * w;
    const normalized = (v - paddedMin) / span;
    const y = padTop + (1 - normalized) * h;
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

  return {
    line: linePath,
    area: areaPath,
    endX: last.x,
    endY: last.y,
    isUp: values[n - 1] >= values[0],
  };
}

export default function PortfolioSparkline({
  width = 300,
  height = 96,
  values = [],
}: Props) {
  const chart = useMemo(() => {
    if (values.length < 2) return null;
    return buildPaths(values, width, height);
  }, [values, width, height]);

  const colors = chart?.isUp
    ? {
        fillTop: "#62D24C",
        fillBottom: "#62D24C",
        lineStart: "#9BE38A",
        lineEnd: "#37B24D",
        dot: "#37B24D",
        dotGlow: "#37B24D",
      }
    : {
        fillTop: "#F87171",
        fillBottom: "#F87171",
        lineStart: "#FCA5A5",
        lineEnd: "#EF4444",
        dot: "#EF4444",
        dotGlow: "#EF4444",
      };

  if (!chart) {
    return <View style={[styles.wrap, { width, height }]} />;
  }

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.fillTop} stopOpacity="0.22" />
            <Stop offset="100%" stopColor={colors.fillBottom} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={colors.lineStart} />
            <Stop offset="100%" stopColor={colors.lineEnd} />
          </LinearGradient>
        </Defs>
        <Path d={chart.area} fill="url(#sparkFill)" />
        <Path
          d={chart.line}
          stroke="url(#sparkLine)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={chart.endX} cy={chart.endY} r={5} fill={colors.dot} />
        <Circle
          cx={chart.endX}
          cy={chart.endY}
          r={9}
          fill={colors.dotGlow}
          fillOpacity={0.18}
        />
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
