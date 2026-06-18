import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import DrillChoiceLabel from "./DrillChoiceLabel";
import { getDrillChoicePlainText } from "../../utils/drillFitLayout";
import {
  useChoiceDrillLayout,
  useUniformChoiceRowHeight,
} from "../../hooks/useChoiceDrillLayout";
import { useLessonTheme } from "../../context/LessonThemeContext";

export interface PathOption {
  id: string;
  text?: string;
  label?: string;
  speechbubbleText?: string;
  explanation?: string;
  explanationImageUrl?: string;
  explanationImagePath?: string;
  explanationSvgCode?: string;
  explanationSvgUrl?: string;
  explanationSvgPublicUrl?: string;
  explanationSvgPath?: string;
  isComplexMedia?: boolean;
  extraExplanations?: Array<{
    id: string;
    explanation?: string;
    explanationImageUrl?: string;
    explanationImagePath?: string;
    explanationSvgCode?: string;
    explanationSvgUrl?: string;
    explanationSvgPublicUrl?: string;
    explanationSvgPath?: string;
    isComplexMedia?: boolean;
  }>;
}

interface Props {
  options: PathOption[];
  submitText?: string;
  onOptionSelect: (optionId: string) => void;
  onContinue: () => void;
  completedOptions: Set<string>;
}

export default function PathSelectDrill({
  options,
  onOptionSelect,
  completedOptions,
}: Props) {
  const { theme, isPractice } = useLessonTheme();
  const hasExploredAtLeastOne = completedOptions.size >= 1;
  const visibleOptions = options.filter(
    (o) => getDrillChoicePlainText(o as Record<string, unknown>).length > 0,
  );
  const layout = useChoiceDrillLayout(visibleOptions.length, { hasMedia: false });
  const uniformRowHeight = useUniformChoiceRowHeight(
    visibleOptions as Record<string, unknown>[],
    layout,
  );

  return (
    <View style={styles.container}>
      {hasExploredAtLeastOne && (
        <Text
          style={[
            styles.hintText,
            isPractice && { color: theme.choiceDisabledText },
          ]}
        >
          אפשר להמשיך לשלב הבא או לבחור שאלה נוספת
        </Text>
      )}
      <View style={[styles.optionsContainer, { gap: layout.choiceGap }]}>
        {visibleOptions.map((option) => {
          const isCompleted = completedOptions.has(option.id);

          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  paddingVertical: layout.choicePaddingVertical,
                  paddingHorizontal: layout.choicePaddingHorizontal,
                  minHeight: uniformRowHeight,
                  height: uniformRowHeight,
                },
                isPractice
                  ? {
                      backgroundColor: theme.choiceBg,
                      borderColor: theme.choiceBorder,
                      borderWidth: 1,
                    }
                  : styles.optionCardLight,
                pressed && !isCompleted && styles.optionCardPressed,
                pressed &&
                  !isCompleted &&
                  isPractice && {
                    backgroundColor: theme.choiceSelectedBg,
                    borderColor: "transparent",
                  },
                isCompleted && styles.optionCardCompleted,
                isCompleted &&
                  isPractice && {
                    backgroundColor: theme.choiceDisabledBg,
                    borderColor: "transparent",
                    opacity: 0.75,
                  },
              ]}
              onPress={() => {
                if (!isCompleted) {
                  onOptionSelect(option.id);
                }
              }}
              disabled={isCompleted}
            >
              {({ pressed }) => {
                const labelColor = isCompleted
                  ? isPractice
                    ? theme.choiceDisabledText
                    : "#9CA3AF"
                  : pressed
                    ? "#FFFFFF"
                    : isPractice
                      ? theme.choiceText
                      : "#0D2033";

                return (
                  <View style={styles.labelWrap}>
                    <DrillChoiceLabel
                      choice={option}
                      color={labelColor}
                      style={{
                        fontSize: layout.choiceFontSize,
                        lineHeight: layout.choiceLineHeight,
                        fontWeight: "700",
                      }}
                    />
                    {isCompleted && (
                      <Text style={styles.completedIndicator}>✓</Text>
                    )}
                  </View>
                );
              }}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  hintText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5A6B7D",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  optionsContainer: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  optionCard: {
    width: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  labelWrap: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCardLight: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionCardPressed: {
    backgroundColor: "#3372D8",
    shadowColor: "#3F9FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  optionCardCompleted: {
    backgroundColor: "#F3F4F6",
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.85,
  },
  completedIndicator: {
    position: "absolute",
    right: 16,
    fontSize: 20,
    color: "#12B76A",
    fontWeight: "800",
  },
});
