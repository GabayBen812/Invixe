import React, { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import Svg, { Path } from "react-native-svg";
import theme from "../../theme";
import type { DictionaryEntry } from "../../data/dictionary";

const THUMB_SIZE = 60;

const TOPIC_BG: Record<string, string> = {
  candles: "#FFF1E6",
  graphs: "#E8F4FF",
  "support-resistance": "#E8FBF2",
  indicators: "#F3EEFF",
  markets: "#FFFBE8",
};

const TOPIC_LABEL: Record<string, string> = {
  candles: "נרות",
  graphs: "גרפים",
  "support-resistance": "תמיכה והתנגדות",
  indicators: "מדדים",
  markets: "שווקים",
};

type Props = {
  entry: DictionaryEntry;
  isLocked: boolean;
  onPress: () => void;
};

function LockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 1C9.24 1 7 3.24 7 6V8H5C3.9 8 3 8.9 3 10V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V10C21 8.9 20.1 8 19 8H17V6C17 3.24 14.76 1 12 1ZM12 3C13.65 3 15 4.35 15 6V8H9V6C9 4.35 10.35 3 12 3Z"
        fill={theme.colors.neutral[400]}
      />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6L9 12L15 18"
        stroke={theme.colors.primary[400]}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function DictionaryTermRow({ entry, isLocked, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const ImageComponent = entry.imageComponent;
  const thumbBg = isLocked
    ? theme.colors.neutral[200]
    : (TOPIC_BG[entry.topicId] ?? theme.colors.info[100]);
  const categoryLabel = TOPIC_LABEL[entry.topicId];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.97,
          useNativeDriver: true,
          speed: 60,
          bounciness: 2,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 3,
        }).start()
      }
      disabled={isLocked}
    >
      <Animated.View
        style={[
          styles.card,
          isLocked && styles.cardLocked,
          { transform: [{ scale }] },
        ]}
      >
        {/* Left: chevron or lock */}
        <View style={styles.leading}>
          {isLocked ? <LockIcon /> : <ChevronIcon />}
        </View>

        {/* Center: term name + category label */}
        <View style={styles.body}>
          <Text
            style={[styles.term, isLocked && styles.termMuted]}
            numberOfLines={1}
          >
            {entry.term}
          </Text>
          {isLocked ? (
            <Text style={styles.lockHint}>יפתח לאחר השלמת השיעור</Text>
          ) : (
            categoryLabel && (
              <Text style={styles.category}>{categoryLabel}</Text>
            )
          )}
        </View>

        {/* Right: thumbnail */}
        <View style={[styles.thumb, { backgroundColor: thumbBg }]}>
          {!isLocked && ImageComponent ? (
            <ImageComponent
              width={THUMB_SIZE - 20}
              height={THUMB_SIZE - 20}
            />
          ) : (
            <Text style={[styles.thumbLetter, isLocked && styles.thumbLetterMuted]}>
              {entry.term.charAt(0)}
            </Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLocked: {
    backgroundColor: theme.colors.neutral[100],
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.75,
  },
  leading: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  body: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
  },
  term: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
    width: "100%",
  },
  termMuted: {
    color: theme.colors.neutral[500],
  },
  category: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    marginTop: 3,
    textAlign: "right",
  },
  lockHint: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    marginTop: 3,
    textAlign: "right",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    flexShrink: 0,
    overflow: "hidden",
  },
  thumbLetter: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
  },
  thumbLetterMuted: {
    color: theme.colors.neutral[300],
  },
});
