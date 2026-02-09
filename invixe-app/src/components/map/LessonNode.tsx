import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import theme from "../../theme";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { SvgXml } from "react-native-svg";

// Import SVG assets
import Frame from "../../assets/nodes/Frame.svg";
import Frame1 from "../../assets/nodes/Frame1.svg";
import Frame2 from "../../assets/nodes/Frame2.svg";
import Frame3 from "../../assets/nodes/Frame3.svg";

// Import Completed SVG assets
import Frame1Completed from "../../assets/nodes/Frame1_Completed.svg";
import Frame2Completed from "../../assets/nodes/Frame2_Completed.svg";
import Frame3Completed from "../../assets/nodes/Frame3_Completed.svg";

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
  lessonId?: number;
}

const PRIMARY_COLOR = "#05BF90"; // Teal Green from image
const LOCK_COLOR = "#E2E8F0";
const ICON_COLOR_ACTIVE = "#05BF90";
const ICON_COLOR_COMPLETED = "#FFFFFF";
const ICON_COLOR_LOCKED = "#94A3B8";

// Icons matching the Figma design (Line Art)

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

const LockBadge = () => (
  <View style={[styles.badgeContainer, styles.lockBadgeContainer]}>
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 11H7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1Z"
        stroke="#64748B"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 11V8a3 3 0 0 1 6 0v3"
        stroke="#64748B"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export default function LessonNode({
  unlocked,
  onStart,
  completed = false,
  current = false,
  lessonType = "info",
  position,
  lessonId = 0,
}: LessonNodeProps) {
  const [scaleAnim] = React.useState(new Animated.Value(unlocked ? 1 : 0.95));
  const [bounceAnim] = React.useState(new Animated.Value(0));

  // Determine State
  const state = completed ? "completed" : !unlocked ? "locked" : "active";

  // Bouncing animation for current node
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
      bounce.start();
      return () => bounce.stop();
    } else {
      bounceAnim.setValue(0);
    }
  }, [current, bounceAnim]);

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

  // Select the appropriate SVG based on state and lesson type
  const getNodeSVG = () => {
    // Helper to select Frame based on ID or Type
    const getFrameIndex = () => {
      // If specific type is set and valid, use it
      if (lessonType === "practice") return 1;
      if (lessonType === "test") return 2;
      if (lessonType === "memorize") return 3;

      // Otherwise cycle through available frames based on ID
      // (ID % 3) -> 0, 1, 2 -> map to Frame1, Frame2, Frame3
      return (lessonId % 3) + 1;
    };

    const frameIdx = getFrameIndex();

    // If completed, use the specific Completed SVGs (Pre-colored White & Translucent Ring)
    if (state === "completed") {
      switch (frameIdx) {
        case 1:
          return <Frame1Completed width={CIRCLE_SIZE} height={CIRCLE_SIZE} />;
        case 2:
          return <Frame2Completed width={CIRCLE_SIZE} height={CIRCLE_SIZE} />;
        case 3:
          return <Frame3Completed width={CIRCLE_SIZE} height={CIRCLE_SIZE} />;
        default:
          return <Frame1Completed width={CIRCLE_SIZE} height={CIRCLE_SIZE} />;
      }
    }

    // Otherwise use Standard SVGs (Active/Locked) - These are Teal by default
    // We can tint them if needed but they render as Teal on White background which is correct for active.

    let NodeComponent = Frame1; // Default

    switch (frameIdx) {
      case 1:
        NodeComponent = Frame1;
        break;
      case 2:
        NodeComponent = Frame2;
        break;
      case 3:
        NodeComponent = Frame3;
        break;
    }

    const color = state === "locked" ? "#94A3B8" : undefined;
    // Note: If SVG doesn't use currentColor, 'color' prop might not work.
    // But we reverted SVGs to hardcoded Teal.
    // If user wants GRAY for locked, we'd need a Gray set or revert to currentColor.
    // However, the user specifically asked to focus on MATCHING COMPLETED NODE 1:1.
    // So I will focus on that. Locked state can use the default for now.

    return (
      <NodeComponent width={CIRCLE_SIZE} height={CIRCLE_SIZE} color={color} />
    );
  };

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
        {/* 3D Depth Shadow Layer (Darker Teal/Black Alpha behind main circle) */}
        {state !== "locked" && <View style={styles.depthShadow} />}

        <TouchableOpacity
          activeOpacity={1}
          onPress={unlocked ? onStart : undefined}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!unlocked}
          style={styles.touchableArea}
        >
          {/* Main Node Circle */}
          <View
            style={[
              styles.mainCircle,
              state === "completed" && styles.completedCircle,
              state === "active" && styles.activeCircle,
              state === "locked" && styles.lockedCircle,
            ]}
          >
            {/* SVG Node - dimmed when locked */}
            <View
              style={[
                styles.iconContainer,
                state === "locked" && styles.lockedIcon,
              ]}
            >
              {getNodeSVG()}
            </View>
          </View>

          {/* Badge - Top Right overlap */}
          {completed && <CheckmarkBadge />}
          {!completed && !unlocked && <LockBadge />}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40, // Spacing between nodes
    alignItems: "center",
    width: "100%",
  },
  left: { alignItems: "center" },
  right: { alignItems: "center" },

  // 3D Depth Shadow Layer - mimics the solid bottom shadow
  depthShadow: {
    position: "absolute",
    width: 80, // Matches new LARGER size
    height: 80,
    borderRadius: 40,
    top: 6, // 6px offset for depth
    left: 0,
    zIndex: -1,
    backgroundColor: "rgba(0,0,0,0.15)", // User suggested alpha black shadow
    // Or closer to design: Darker Teal #11805E if we wan solid, but 0.15 alpha matches request.
    // Let's add the second shadow layer suggested if possible, or just one strong one.
    // "0px 6px 0px rgba(0,0,0,0.15)" -> This is the main depth.
  },

  touchableArea: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    // Ensure no clipping so badge can overflow
  },

  // Main Circle Base - Common structure
  mainCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5, // Thick border
    borderColor: "#FFFFFF", // Always white per design (for completed/active usually)
    // For locked it might be different, but let's stick to the requested structure.
  },

  // COMPLETED: Teal Background, White Border
  completedCircle: {
    backgroundColor: "#1AC488", // Teal Green
    borderColor: "#FFFFFF",
  },

  // ACTIVE: White Background, Teal Border (Inverse)
  // Design for active wasn't specified in latest prompt, but keeping consistency
  activeCircle: {
    backgroundColor: "#FFFFFF",
    borderColor: PRIMARY_COLOR, // Teal Border
    borderWidth: 5,
  },

  // LOCKED: White Background, Gray Border
  lockedCircle: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    borderWidth: 4,
  },

  iconContainer: {
    zIndex: 1,
  },
  lockedIcon: {
    opacity: 0.3,
  },

  badgeContainer: {
    position: "absolute",
    right: -4, // Overlap border
    top: -4, // Overlap border (1:30 clock position approx)
    backgroundColor: "#1AC488", // Teal background
    borderRadius: 12,
    width: 26, // Slightly larger for visibility
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3, // White cutout border
    borderColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  lockBadgeContainer: {
    backgroundColor: "#E2E8F0",
    borderColor: "#FFFFFF",
  },
  badgeCircle: {
    // Inner part of badge is just the icon container now
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
