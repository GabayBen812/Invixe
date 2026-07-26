import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";
import theme from "../../theme";

export const TREND_LINE_COLOR = theme.colors.primaryBlue;

const CHIP_BG = "#0B1A28";
const CHIP_BORDER = "#3F9FFF";
const CHIP_FG = "#3F9FFF";

type Props = {
  enabled: boolean;
  onToggle: () => void;
  style?: ViewStyle;
};

export default function TradingTrendLineToggle({
  enabled,
  onToggle,
  style,
}: Props) {
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
    outputRange: ["rgba(11, 26, 40, 0.55)", CHIP_BG],
  });
  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(63, 159, 255, 0.35)", CHIP_BORDER],
  });
  const foregroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(63, 159, 255, 0.45)", CHIP_FG],
  });

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ selected: enabled }}
      accessibilityLabel="קו מגמה"
      accessibilityHint={
        enabled
          ? "בטל מצב ציור קו מגמה"
          : "צייר קו מגמה על הגרף — הקש שתי נקודות"
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
          קו מגמה
        </Animated.Text>
        <Animated.View style={[styles.icon, { borderColor: foregroundColor }]}>
          <Animated.View
            style={[styles.iconLine, { backgroundColor: foregroundColor }]}
          />
        </Animated.View>
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
  icon: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderRadius: 2,
    transform: [{ rotate: "-35deg" }],
    justifyContent: "center",
  },
  iconLine: {
    height: 2,
    width: 10,
    alignSelf: "center",
    borderRadius: 1,
  },
});
