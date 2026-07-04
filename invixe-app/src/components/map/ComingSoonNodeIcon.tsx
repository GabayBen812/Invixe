import React from "react";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import type { SvgProps } from "react-native-svg";

export type ComingSoonNodeVisualState = "locked" | "active";

type ComingSoonNodeIconProps = SvgProps & {
  visualState?: ComingSoonNodeVisualState;
};

const PALETTE = {
  locked: {
    shellDark: "#AEB9CE",
    shellLight: "#CFD8E7",
    ring: "#94A1B8",
    icon: "#94A1B8",
    stripeDark: "#7C8AA3",
    stripeLight: "#B8C4D4",
    beaconOuter: "#B8C4D4",
    beaconMid: "#94A1B8",
    sparkle: "#FFFFFF",
    sparkleOpacity: 0.35,
  },
  active: {
    shellDark: "#C46A08",
    shellLight: "#F79009",
    ring: "#FFFFFF",
    icon: "#FFFFFF",
    stripeDark: "#0F2233",
    stripeLight: "#F79009",
    beaconOuter: "#FEF0C7",
    beaconMid: "#FBBF24",
    sparkle: "#FFFFFF",
    sparkleOpacity: 0.85,
  },
} as const;

/**
 * Premium construction-barrier icon inside the standard Invixe map-node shell.
 * Matches lesson node proportions (96×100 viewBox).
 */
export default function ComingSoonNodeIcon({
  width = 96,
  height = 100,
  visualState = "locked",
}: ComingSoonNodeIconProps) {
  const colors = PALETTE[visualState];
  const ringOpacity = visualState === "locked" ? 1 : 0.35;

  return (
    <Svg width={width} height={height} viewBox="0 0 96 100" fill="none">
      <G>
        <Rect x={8} y={14} width={80} height={80} rx={40} fill={colors.shellDark} />
        <Rect x={8} y={6} width={80} height={80} rx={40} fill={colors.shellLight} />
      </G>

      <Rect
        x={9}
        y={7}
        width={78}
        height={72}
        rx={36}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={0.28}
        strokeWidth={2}
      />

      <Circle
        cx={48}
        cy={46}
        r={29}
        fill="none"
        stroke={colors.ring}
        strokeOpacity={ringOpacity}
        strokeWidth={5.5}
      />

      <G>
        <Rect
          x={46}
          y={24}
          width={4}
          height={7}
          rx={1}
          fill={colors.icon}
          opacity={0.9}
        />
        <Circle cx={48} cy={22} r={4.5} fill={colors.beaconOuter} />
        <Circle cx={48} cy={22} r={2.8} fill={colors.beaconMid} />
        {visualState === "active" && (
          <Circle cx={48} cy={22} r={1.4} fill="#FFFFFF" opacity={0.7} />
        )}

        <Rect x={29} y={30} width={38} height={14} rx={2.5} fill={colors.icon} />
        <G opacity={0.95}>
          <Path
            d="M32 44 L38 30 M40 44 L46 30 M48 44 L54 30 M56 44 L62 30 M64 44 L70 30"
            stroke={colors.stripeDark}
            strokeWidth={3.2}
            strokeLinecap="round"
          />
          <Path
            d="M26 44 L32 30 M34 44 L40 30 M42 44 L48 30 M50 44 L56 30 M58 44 L64 30"
            stroke={colors.stripeLight}
            strokeWidth={3.2}
            strokeLinecap="round"
          />
        </G>

        <Rect x={34} y={44} width={4} height={10} rx={1} fill={colors.icon} />
        <Rect x={58} y={44} width={4} height={10} rx={1} fill={colors.icon} />
        <Path
          d="M31 54 H39 L37 58 H33 Z M57 54 H65 L63 58 H59 Z"
          fill={colors.icon}
          opacity={0.85}
        />
      </G>

      {visualState === "active" && (
        <Path
          d="M78 18 L79.2 21.2 L82.4 22.4 L79.2 23.6 L78 26.8 L76.8 23.6 L73.6 22.4 L76.8 21.2 Z"
          fill={colors.sparkle}
          opacity={colors.sparkleOpacity}
        />
      )}
    </Svg>
  );
}
