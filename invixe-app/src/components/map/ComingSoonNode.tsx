import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Text,
} from "react-native";
import ComingSoonNodeIcon from "./ComingSoonNodeIcon";
import { CIRCLE_SIZE } from "./LessonNode";
import theme from "../../theme";

const NODE_WIDTH = CIRCLE_SIZE;
const NODE_HEIGHT = Math.round(CIRCLE_SIZE * (100 / 96));
const TOUCH_WIDTH = NODE_WIDTH + 8;
const TOUCH_HEIGHT = NODE_HEIGHT + 4;
const PULSE_SIZE = CIRCLE_SIZE - 4;

interface ComingSoonNodeProps {
  onPress: () => void;
  position?: "left" | "right";
  /** Active orange styling + pulse when all lessons in the unit are complete. */
  highlighted?: boolean;
}

export default function ComingSoonNode({
  onPress,
  position,
  highlighted = false,
}: ComingSoonNodeProps) {
  const [scaleAnim] = React.useState(new Animated.Value(1));
  const [pulseAnim] = React.useState(new Animated.Value(0));
  const [beaconAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (!highlighted) {
      pulseAnim.setValue(0);
      beaconAnim.setValue(0);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const beacon = Animated.loop(
      Animated.sequence([
        Animated.timing(beaconAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(beaconAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    beacon.start();
    return () => {
      pulse.stop();
      beacon.stop();
    };
  }, [highlighted, pulseAnim, beaconAnim]);

  const handlePressIn = () => {
    if (!highlighted) return;
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      friction: 6,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!highlighted) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1.45],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.45, 0.12, 0],
  });
  const beaconOpacity = beaconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });

  const icon = (
    <ComingSoonNodeIcon
      width={NODE_WIDTH}
      height={NODE_HEIGHT}
      visualState={highlighted ? "active" : "locked"}
    />
  );

  return (
    <View
      style={[
        styles.container,
        position === "left" ? styles.left : styles.right,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={highlighted ? 1 : 0.7}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.touchableArea}
          accessibilityRole="button"
          accessibilityLabel="עוד שיעורים בדרך"
        >
          {highlighted && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulseRing,
                {
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />
          )}
          {highlighted ? (
            <Animated.View style={{ opacity: beaconOpacity }}>{icon}</Animated.View>
          ) : (
            icon
          )}
        </TouchableOpacity>
      </Animated.View>

      <View
        style={[
          styles.badge,
          highlighted ? styles.badgeActive : styles.badgeLocked,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            highlighted ? styles.badgeTextActive : styles.badgeTextLocked,
          ]}
        >
          בקרוב
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    alignItems: "center",
    width: "100%",
  },
  left: { alignItems: "center" },
  right: { alignItems: "center" },
  touchableArea: {
    width: TOUCH_WIDTH,
    height: TOUCH_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseRing: {
    position: "absolute",
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    borderRadius: PULSE_SIZE / 2,
    backgroundColor: "#F79009",
    top: (TOUCH_HEIGHT - PULSE_SIZE) / 2 + 2,
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: "rgba(247, 144, 9, 0.14)",
    borderColor: "rgba(247, 144, 9, 0.35)",
  },
  badgeLocked: {
    backgroundColor: "rgba(148, 161, 184, 0.14)",
    borderColor: "rgba(148, 161, 184, 0.35)",
  },
  badgeText: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    letterSpacing: 0.2,
  },
  badgeTextActive: {
    color: "#B45309",
  },
  badgeTextLocked: {
    color: "#64748B",
  },
});
