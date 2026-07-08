import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useLessonTheme } from "../../context/LessonThemeContext";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Tighter padding for small inline assets (e.g. yes/no cards). */
  compact?: boolean;
  /** No inner padding — use for full-bleed chart explanation media. */
  flush?: boolean;
};

/**
 * In practice lessons, wraps chart/SVG assets on a dark panel so they
 * sit cleanly on the tirgul background without a bright white card.
 * In light mode, renders children unchanged.
 */
export default function PracticeMediaSurface({
  children,
  style,
  compact = false,
  flush = false,
}: Props) {
  const { theme, isPractice } = useLessonTheme();

  if (!isPractice) {
    if (style) {
      return <View style={style}>{children}</View>;
    }
    return <>{children}</>;
  }

  return (
    <View
      style={[
        styles.surface,
        compact && styles.surfaceCompact,
        flush && styles.surfaceFlush,
        {
          backgroundColor: theme.mediaSurfaceBg,
          borderColor: theme.mediaSurfaceBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  surfaceCompact: {
    padding: 8,
    borderRadius: 12,
  },
  surfaceFlush: {
    padding: 0,
  },
});
