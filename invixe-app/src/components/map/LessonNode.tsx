import React from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import theme from "../../theme";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";

export const CIRCLE_SIZE = 72;
const ACTIVE_SCALE = 1.1;

interface LessonNodeProps {
  title?: string;
  unlocked: boolean;
  onStart: () => void;
  showConnector?: boolean;
  completed?: boolean;
  current?: boolean;
  position?: "left" | "right";
  lessonType?: "memorize" | "info" | "test" | "practice";
}

const PRIMARY_COLOR = "#05BF90"; // Teal Green from image
const LOCK_COLOR = "#E2E8F0";
const ICON_COLOR_ACTIVE = "#05BF90";
const ICON_COLOR_COMPLETED = "#FFFFFF";
const ICON_COLOR_LOCKED = "#94A3B8";

// Icons matching the Figma design (Line Art)

// Graph Icon (Info)
const InfoIcon = ({ color }: { color: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12L3 12.01"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Path
      d="M3 18L3 18.01"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Path
      d="M3 6L3 6.01"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Path
      d="M8 12L21 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M8 18L21 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path d="M8 6L21 6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="16" cy="10" r="5" stroke={color} strokeWidth={2} />
    <Path d="M19 14L13 14" stroke={color} strokeWidth={2} />
  </Svg>
);

// Candles Icon (Practice/Memorize)
const PracticeIcon = ({ color }: { color: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M7 4V20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M17 4V20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Rect
      x="5"
      y="8"
      width="4"
      height="8"
      rx="1"
      fill={color}
      stroke={color}
      strokeWidth={2}
    />
    <Rect
      x="15"
      y="6"
      width="4"
      height="6"
      rx="1"
      fill={color}
      stroke={color}
      strokeWidth={2}
    />
    <Rect
      x="15"
      y="15"
      width="4"
      height="3"
      rx="1"
      fill={color}
      stroke={color}
      strokeWidth={2}
    />
  </Svg>
);

// Sliders Icon (Test)
const TestIcon = ({ color }: { color: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M6 4V20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 4V20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M18 4V20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="6" cy="14" r="2" fill={color} />
    <Circle cx="12" cy="8" r="2" fill={color} />
    <Circle cx="18" cy="16" r="2" fill={color} />
  </Svg>
);

// Generic Graph/Analysis Icon (Memorize/Default)
const MemorizeIcon = ({ color }: { color: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21L21 21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path d="M3 21L3 3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path
      d="M7 14L11 10L15 14L21 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="14" cy="10" r="4" stroke={color} strokeWidth={2} />
  </Svg>
);

const CheckmarkBadge = () => (
  <View style={styles.badgeContainer}>
    <View style={styles.badgeCircle}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 6L9 17L4 12"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  </View>
);

const getLessonIcon = (
  lessonType: string,
  state: "completed" | "active" | "locked",
) => {
  const color =
    state === "completed"
      ? ICON_COLOR_COMPLETED
      : state === "locked"
        ? ICON_COLOR_LOCKED
        : ICON_COLOR_ACTIVE;

  // Custom mapping based on visuals (Trying to match specific icons to types if possible, otherwise generic)
  switch (lessonType) {
    case "practice":
      return <PracticeIcon color={color} />;
    case "test":
      return <TestIcon color={color} />;
    case "memorize":
      return <MemorizeIcon color={color} />;
    case "info":
    default:
      return <InfoIcon color={color} />;
  }
};

export default function LessonNode({
  unlocked,
  onStart,
  completed = false,
  current = false,
  lessonType = "info",
  position,
}: LessonNodeProps) {
  const [scaleAnim] = React.useState(new Animated.Value(unlocked ? 1 : 0.95));

  // Determine State
  const state = completed ? "completed" : !unlocked ? "locked" : "active";

  const handlePressIn = () => {
    if (unlocked) {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (unlocked) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View
      style={[
        styles.container,
        position === "left" ? styles.left : styles.right,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={unlocked ? onStart : undefined}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!unlocked}
          style={[
            styles.nodeBase,
            state === "completed" && styles.nodeCompleted,
            state === "active" && styles.nodeActive,
            state === "locked" && styles.nodeLocked,
          ]}
        >
          {/* Inner ring for active state */}
          {state === "active" && <View style={styles.activeInnerRing} />}

          {/* Icon */}
          <View style={styles.iconContainer}>
            {getLessonIcon(lessonType, state)}
          </View>

          {/* Badge */}
          {completed && <CheckmarkBadge />}
        </TouchableOpacity>
      </Animated.View>

      {/* Label or Popover could go here, handled by parent usually */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    alignItems: "center",
    width: "100%",
  },
  left: { alignItems: "center" }, // Position handled by parent x/y, just center content
  right: { alignItems: "center" },

  nodeBase: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  nodeCompleted: {
    backgroundColor: PRIMARY_COLOR,
    borderWidth: 0,
  },

  nodeActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: PRIMARY_COLOR,
  },

  nodeLocked: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    borderWidth: 4,
  },

  activeInnerRing: {
    position: "absolute",
    width: CIRCLE_SIZE - 16,
    height: CIRCLE_SIZE - 16,
    borderRadius: (CIRCLE_SIZE - 16) / 2,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    opacity: 0.3,
  },

  iconContainer: {
    zIndex: 1,
  },

  badgeContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "white",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  badgeCircle: {
    backgroundColor: PRIMARY_COLOR,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
