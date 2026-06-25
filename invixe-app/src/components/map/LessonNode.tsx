import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import {
  getNodeAsset,
  type NodeVisualState,
  type UnitAssetId,
} from "./nodeAssets";

export const CIRCLE_SIZE = 88;
const NODE_WIDTH = CIRCLE_SIZE;
const NODE_HEIGHT = Math.round(CIRCLE_SIZE * (100 / 96));
const TOUCH_WIDTH = NODE_WIDTH + 8;
const TOUCH_HEIGHT = NODE_HEIGHT + 4;
const PULSE_SIZE = CIRCLE_SIZE - 4;

interface LessonNodeProps {
  title?: string;
  unlocked: boolean;
  onStart: () => void;
  showConnector?: boolean;
  completed?: boolean;
  current?: boolean;
  position?: "left" | "right";
  unitAssetId: UnitAssetId;
}

export default function LessonNode({
  unlocked,
  onStart,
  completed = false,
  current = false,
  position,
  unitAssetId,
}: LessonNodeProps) {
  const [scaleAnim] = React.useState(new Animated.Value(1));
  const [bounceAnim] = React.useState(new Animated.Value(0));
  const [pulseAnim] = React.useState(new Animated.Value(0));

  const visualState: NodeVisualState = completed
    ? "completed"
    : current
      ? "inuse"
      : "locked";

  const NodeSvg = getNodeAsset(unitAssetId, visualState);

  React.useEffect(() => {
    if (current) {
      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -12,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
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
      bounce.start();
      pulse.start();
      return () => {
        bounce.stop();
        pulse.stop();
      };
    }
    bounceAnim.setValue(0);
    pulseAnim.setValue(0);
  }, [current, bounceAnim, pulseAnim]);

  const handlePressIn = () => {
    if (unlocked) {
      Animated.spring(scaleAnim, {
        toValue: 0.94,
        friction: 6,
        tension: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (unlocked) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.4],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.55, 0.15, 0],
  });

  return (
    <View
      style={[
        styles.container,
        position === "left" ? styles.left : styles.right,
      ]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={unlocked ? onStart : undefined}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!unlocked}
          style={styles.touchableArea}
        >
          {current && (
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
          <NodeSvg width={NODE_WIDTH} height={NODE_HEIGHT} />
        </TouchableOpacity>
      </Animated.View>
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
    backgroundColor: "#3F9FFF",
    top: (TOUCH_HEIGHT - PULSE_SIZE) / 2 + 2,
  },
});
