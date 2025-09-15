import React from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

type ProgressBarProps = {
  progress: number;
  width?: number;
  height?: number;
};

export default function ProgressBar({ progress, width = 200, height = 6 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress || 0));
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#0EA5E9" />
          <Stop offset="100%" stopColor="#3B82F6" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} rx={height / 2} fill="#F1F5F9" />
      <Rect x="0" y="0" width={width * clamped} height={height} rx={height / 2} fill="url(#progressGradient)" />
    </Svg>
  );
}


