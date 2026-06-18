import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useLessonTheme } from "../../context/LessonThemeContext";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Tighter padding for small inline assets (e.g. yes/no cards). */
  compact?: boolean;
};

/**
 * In practice lessons, wraps chart/SVG assets on a light surface so
 * dark labels and artwork remain readable against the dark screen.
 * In light mode, renders children unchanged.
 */
export default function PracticeMediaSurface({
  children,
  style,
  compact = false,
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
});
