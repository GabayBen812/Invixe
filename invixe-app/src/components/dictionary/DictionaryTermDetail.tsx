import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import theme from "../../theme";
import type { DictionaryEntry } from "../../data/dictionary";
import { dictionaryTextRtl } from "./dictionaryRtl";

type Props = {
  entry: DictionaryEntry;
  onBack: () => void;
};

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={theme.colors.text}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function DictionaryTermDetail({ entry, onBack }: Props) {
  const { width } = useWindowDimensions();
  const ImageComponent = entry.imageComponent;
  const visualSize = Math.min(width - 80, 220);

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
        <BackIcon />
        <Text style={styles.backText}>חזרה לרשימה</Text>
      </Pressable>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.visualPanel}>
          {ImageComponent ? (
            <ImageComponent width={visualSize} height={visualSize} />
          ) : (
            <View style={styles.visualFallback}>
              <Text style={styles.visualFallbackText}>{entry.term}</Text>
            </View>
          )}
        </View>

        <Text style={styles.term}>{entry.term}</Text>
        <Text style={styles.explanation}>{entry.explanation}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 6,
  },
  backText: {
    fontSize: 15,
    fontFamily: theme.font.family,
    color: theme.colors.text,
    ...dictionaryTextRtl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  visualPanel: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  visualFallback: {
    width: 160,
    height: 160,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  visualFallbackText: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
    ...dictionaryTextRtl,
  },
  term: {
    fontSize: 26,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    ...dictionaryTextRtl,
  },
  explanation: {
    fontSize: 17,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[700],
    lineHeight: 28,
    ...dictionaryTextRtl,
  },
});
