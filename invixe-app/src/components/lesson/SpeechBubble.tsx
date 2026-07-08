import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import CharacterPrimarySVG from "./CharacterPrimarySVG";
import HtmlText from "../ui/HtmlText";
import { useLessonTheme } from "../../context/LessonThemeContext";
import { sanitizeDisplayText } from "../../utils/decodeHtmlEntities";

interface SpeechBubbleProps {
  message: string;
  characterImg?: ImageSourcePropType;
  showCharacter?: boolean; // Explicitly control whether to show character and tail
  position?: "bottomLeft" | "bottomRight" | "topLeft" | "topRight" | "center";
  align?: "flex-start" | "flex-end" | "center";
  buttonText?: string;
  onButtonPress?: () => void;
  typingSpeedMs?: number; // characters per tick
  disableTyping?: boolean; // show full text immediately
  disableEnterAnim?: boolean; // do not animate on mount (used for shadows)
  randomPosition?: boolean; // randomly position character left or right (for drills)
}

// Threshold after which we consider the message "very long" and hide the avatar
// Lower threshold to prevent speech bubble from becoming too tall
const LONG_MESSAGE_THRESHOLD = 100;

export default function SpeechBubble({
  message,
  characterImg,
  showCharacter = true, // Default to true for backward compatibility
  position = "bottomLeft",
  align = "center",
  buttonText,
  onButtonPress,
  typingSpeedMs = 18,
  disableTyping = false,
  disableEnterAnim = false,
  randomPosition = false,
}: SpeechBubbleProps) {
  const { theme, isPractice } = useLessonTheme();

  // Don't render speech bubble if message is empty or whitespace-only - NEVER render if no text
  // Check multiple conditions to be absolutely sure
  const displayMessage =
    typeof message === "string" ? sanitizeDisplayText(message) : "";
  const trimmedMessage = displayMessage.trim();
  if (
    !message ||
    typeof message !== "string" ||
    trimmedMessage.length === 0 ||
    message === "" ||
    message === " "
  ) {
    return null;
  }

  // Detect very long messages to save vertical space by hiding the avatar
  const isVeryLongMessage = trimmedMessage.length > LONG_MESSAGE_THRESHOLD;

  // Random position for drills - randomly choose left or right
  const [randomSide, setRandomSide] = React.useState<"left" | "right" | null>(
    null,
  );

  React.useEffect(() => {
    if (randomPosition) {
      // Generate random position once per component mount
      const side = Math.random() < 0.5 ? "left" : "right";
      setRandomSide(side);
    } else {
      setRandomSide(null);
    }
  }, [randomPosition]);

  // Determine actual position
  let actualPosition = position;
  if (randomPosition && randomSide) {
    const isTop = position === "topLeft" || position === "topRight";
    actualPosition =
      randomSide === "left"
        ? isTop
          ? "topLeft"
          : "bottomLeft"
        : isTop
          ? "topRight"
          : "bottomRight";
  }

  // Horizontal alignment and speaker side
  let alignSelf: "flex-start" | "flex-end" | "center" = "center";
  const isLeft =
    actualPosition === "bottomLeft" || actualPosition === "topLeft";
  const isRight =
    actualPosition === "bottomRight" || actualPosition === "topRight";
  const isCenter = actualPosition === "center";
  if (isLeft) alignSelf = "flex-start";
  if (isRight) alignSelf = "flex-end";
  if (isCenter) alignSelf = "center";

  // When message contains HTML, show full text at once (no typing) and render as HTML
  const hasHtml = /<[^>]+>/.test(displayMessage);
  const effectiveDisableTyping = disableTyping || hasHtml;

  // Typing animation state
  const [typed, setTyped] = React.useState(
    effectiveDisableTyping ? displayMessage : "",
  );
  const [typing, setTyping] = React.useState(!effectiveDisableTyping);
  const slideIn = React.useRef(new Animated.Value(20)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    setTyped(effectiveDisableTyping ? displayMessage : "");
    setTyping(!effectiveDisableTyping);
    if (disableEnterAnim) {
      slideIn.setValue(0);
      opacity.setValue(1);
    } else {
      Animated.parallel([
        Animated.timing(slideIn, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }

    if (effectiveDisableTyping) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTyped((prev) => {
        const nextLen = Math.min(displayMessage.length, (prev?.length || 0) + 1);
        const next = displayMessage.slice(0, nextLen);
        if (nextLen === displayMessage.length) {
          clearInterval(interval);
          setTyping(false);
        }
        return next;
      });
    }, typingSpeedMs);
    return () => clearInterval(interval);
  }, [displayMessage, effectiveDisableTyping, typingSpeedMs, disableEnterAnim]);

  // Typing dots animation
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!typing) return;
    const makeAnim = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    makeAnim(dot1, 0);
    makeAnim(dot2, 150);
    makeAnim(dot3, 300);
    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [typing]);

  const renderAvatar = (flip: boolean) => {
    if (characterImg) {
      return (
        <Image
          source={characterImg}
          style={[styles.avatar, flip && styles.avatarFlipped]}
        />
      );
    }
    return (
      <View style={flip && styles.avatarFlipped}>
        <CharacterPrimarySVG size={80} />
      </View>
    );
  };

  const messageArea = (
    <View style={styles.messageArea}>
      <HtmlText
        value={typed}
        style={[styles.text, isPractice && { color: theme.speechBubbleText }]}
      />
      {(typing || buttonText) && (
        <View style={styles.bottomRow}>
          {typing && typed.length < displayMessage.length ? (
            <View style={styles.typingRow}>
              <Animated.View style={[styles.dot, { opacity: dot1 }]} />
              <Animated.View style={[styles.dot, { opacity: dot2 }]} />
              <Animated.View style={[styles.dot, { opacity: dot3 }]} />
            </View>
          ) : null}
          {buttonText ? (
            <TouchableOpacity style={styles.button} onPress={onButtonPress}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );

  // When no character, make it centered and full-width
  // Character is present if showCharacter is true (uses SVG fallback if no image)
  const hasCharacter = !!showCharacter;

  // Determine if character is actually being rendered (visible)
  // For beside positions (left/right) always show the character — the avatar doesn't
  // affect bubble height there. Only suppress for center/inside layout on very long messages.
  const isCharacterVisible = hasCharacter && (!isVeryLongMessage || isLeft || isRight);

  // Character BESIDE the bubble = left or right (avatar next to the bubble, with a tail).
  // Character INSIDE the bubble = center only (avatar in same row as message, no tail).
  const characterBeside = isCharacterVisible && (isLeft || isRight);
  const avatarInside = isCharacterVisible && !characterBeside;
  const shouldShowTail = characterBeside;

  // Tail points toward the character at mouth height, on the bubble edge nearest the avatar.
  const getTailStyle = () => {
    if (isRight) {
      return {
        style: styles.tailRightTowardCharacter,
        path: "M 0 0 L 12 7 L 0 14 Z",
        width: 12,
        height: 14,
      };
    }
    if (isLeft) {
      return {
        style: styles.tailLeftTowardCharacter,
        path: "M 12 0 L 0 7 L 12 14 Z",
        width: 12,
        height: 14,
      };
    }
    return null;
  };

  const bubbleNode = (
    <Animated.View
      style={[
        styles.bubbleContainer,
        isPractice && {
          backgroundColor: theme.speechBubbleBg,
        },
        { alignSelf, transform: [{ translateY: slideIn }], opacity },
        // Constrain width when the avatar sits beside the bubble (left or right)
        characterBeside && styles.bubbleContainerBeside,
        // When no character, make it full-width and centered
        !isCharacterVisible && styles.bubbleContainerNoCharacter,
      ]}
    >
      <View
        style={[
          styles.row,
          isRight && styles.rowRight,
          !isCharacterVisible && styles.rowNoCharacter,
        ]}
      >
        {avatarInside && (
          <View
            style={[
              styles.avatarWrap,
              isPractice && styles.avatarWrapPractice,
            ]}
          >
            {renderAvatar(false)}
          </View>
        )}
        {messageArea}
      </View>
      {/* Speech bubble tail - only when character is beside (right); hidden when character is inside bubble */}
      {shouldShowTail &&
        (() => {
          const tailConfig = getTailStyle();
          if (!tailConfig) return null;
          return (
            <View style={[styles.tailContainer, tailConfig.style]}>
              <Svg width={tailConfig.width} height={tailConfig.height}>
                <Path
                  d={tailConfig.path}
                  fill={isPractice ? theme.speechBubbleTail : "#FFFFFF"}
                />
              </Svg>
            </View>
          );
        })()}
    </Animated.View>
  );

  if (characterBeside) {
    const avatarNode = (
      <View
        style={[
          styles.avatarOutsideWrap,
          isPractice && styles.avatarWrapPractice,
        ]}
      >
        {/* Flip so the character faces the bubble: face left when on the right, face right when on the left */}
        {renderAvatar(isRight)}
      </View>
    );

    return (
      <View style={[styles.besideWrapper, { alignSelf }]}>
        {isLeft && avatarNode}
        {bubbleNode}
        {isRight && avatarNode}
      </View>
    );
  }

  return bubbleNode;
}

const styles = StyleSheet.create({
  bubbleContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignSelf: "center",
    width: "94%",
    maxWidth: 480,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.12,
    // shadowRadius: 14,
    // elevation: 6,
    position: "relative",
  },
  bubbleContainerBeside: {
    marginLeft: 0,
    flex: 1,
    minWidth: 0,
    maxWidth: "74%",
  },
  bubbleContainerNoCharacter: {
    width: "100%",
    maxWidth: "100%",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowRight: {
    justifyContent: "flex-end",
  },
  rowNoCharacter: {
    justifyContent: "center",
  },
  besideWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    width: "100%",
    paddingHorizontal: 12,
    alignSelf: "center",
  },
  avatarWrap: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#E6F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarOutsideWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E6F0FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 8,
  },
  avatarWrapPractice: {
    backgroundColor: "transparent",
  },
  avatar: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  avatarFlipped: {
    transform: [{ scaleX: -1 }],
  } as const,
  messageArea: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 1,
  },
  text: {
    fontSize: 18,
    color: "#1e355e",
    textAlign: "right",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  typingRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A0AEC0",
  },
  button: {
    backgroundColor: "#3F9FFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  shadowWingLeft: {
    position: "absolute",
    left: 18,
    bottom: -6,
    width: 34,
    height: 10,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 6,
    transform: [{ rotate: "-8deg" }],
  },
  shadowWingRight: {
    position: "absolute",
    right: 18,
    bottom: -6,
    width: 34,
    height: 10,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 6,
    transform: [{ rotate: "8deg" }],
  },
  tailContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  // Tail sits near the avatar's mouth (avatar is top-aligned with ~8px offset, ~80px tall).
  tailRightTowardCharacter: {
    right: -10,
    top: 46,
  },
  tailLeftTowardCharacter: {
    left: -10,
    top: 46,
  },
});
