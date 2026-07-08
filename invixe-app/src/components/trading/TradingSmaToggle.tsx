import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";
import theme from "../../theme";

/** Chart + chip swatch color — matches the MA line on the graph */
export const SMA_150_COLOR = "#D4A356";

const CHIP_BG = "#1A120B";
const CHIP_BORDER = "#8C6D3E";
const CHIP_FG = "#D4A356";

type Props = {
  enabled: boolean;
  onToggle: () => void;
  style?: ViewStyle;
};

export default function TradingSmaToggle({ enabled, onToggle, style }: Props) {
  const progress = useRef(new Animated.Value(enabled ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: enabled ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [enabled, progress]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(26, 18, 11, 0.55)", CHIP_BG],
  });
  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(140, 109, 62, 0.35)", CHIP_BORDER],
  });
  const foregroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(212, 163, 86, 0.4)", CHIP_FG],
  });

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ selected: enabled }}
      accessibilityLabel="ממוצע 150"
      accessibilityHint={
        enabled ? "הסתר ממוצע נע 150" : "הצג ממוצע נע 150"
      }
      hitSlop={8}
      style={({ pressed }) => [
        styles.hitTarget,
        style,
        pressed && styles.pressed,
      ]}
    >
      <Animated.View style={[styles.chip, { backgroundColor, borderColor }]}>
        <Animated.Text style={[styles.label, { color: foregroundColor }]}>
          ממוצע 150
        </Animated.Text>
        <Animated.View
          style={[styles.swatch, { backgroundColor: foregroundColor }]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitTarget: {
    alignSelf: "flex-start",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 34,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    letterSpacing: 0.1,
    writingDirection: "rtl",
  },
  swatch: {
    width: 16,
    height: 3,
    borderRadius: 2,
  },
});
