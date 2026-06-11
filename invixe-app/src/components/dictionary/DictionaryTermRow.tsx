import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import theme from "../../theme";
import type { DictionaryEntry } from "../../data/dictionary";
import { dictionaryTextRtl } from "./dictionaryRtl";

const THUMB_SIZE = 52;

type Props = {
  entry: DictionaryEntry;
  isLocked: boolean;
  onPress: () => void;
};

function LockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2C8.34 2 7 3.34 7 5V7H5C4.45 7 4 7.45 4 8V16C4 16.55 4.45 17 5 17H15C15.55 17 16 16.55 16 16V8C16 7.45 15.55 7 15 7H13V5C13 3.34 11.66 2 10 2ZM10 3.5C10.83 3.5 11.5 4.17 11.5 5V7H8.5V5C8.5 4.17 9.17 3.5 10 3.5Z"
        fill={theme.colors.neutral[500]}
      />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6L9 12L15 18"
        stroke={theme.colors.primary[400]}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function DictionaryTermRow({ entry, isLocked, onPress }: Props) {
  const ImageComponent = entry.imageComponent;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isLocked && styles.rowLocked,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.leading}>
        {isLocked ? <LockIcon /> : <ChevronIcon />}
      </View>

      <View style={styles.body}>
        <Text
          style={[styles.term, isLocked && styles.termLocked]}
          numberOfLines={1}
        >
          {entry.term}
        </Text>
        {isLocked && (
          <Text style={styles.lockHint}>יפתח לאחר השלמת השיעור</Text>
        )}
      </View>

      <View style={[styles.thumb, isLocked && styles.thumbLocked]}>
        {ImageComponent ? (
          <ImageComponent width={THUMB_SIZE - 16} height={THUMB_SIZE - 16} />
        ) : (
          <Text style={styles.thumbFallback}>
            {entry.term.charAt(0)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  rowLocked: {
    backgroundColor: theme.colors.neutral[100],
    opacity: 0.85,
  },
  rowPressed: {
    backgroundColor: theme.colors.overlay.hover,
  },
  leading: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    backgroundColor: theme.colors.info[100],
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    flexShrink: 0,
  },
  thumbLocked: {
    backgroundColor: theme.colors.neutral[200],
  },
  thumbFallback: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  term: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    ...dictionaryTextRtl,
  },
  termLocked: {
    color: theme.colors.neutral[500],
  },
  lockHint: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    marginTop: 2,
    ...dictionaryTextRtl,
  },
});
