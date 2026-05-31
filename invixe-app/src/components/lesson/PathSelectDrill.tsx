import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import DrillChoiceLabel from "./DrillChoiceLabel";
import { getDrillChoicePlainText } from "../../utils/drillFitLayout";

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
  // Optional additional explanation screens for this option.
  // The drill UI itself doesn't use these directly, but they are
  // available so the lesson screen can render multiple explanation
  // screens per option if needed.
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
  completedOptions: Set<string>; // Set of completed option IDs
}

export default function PathSelectDrill({
  options,
  submitText = "המשך",
  onOptionSelect,
  onContinue,
  completedOptions,
}: Props) {
  const hasExploredAtLeastOne = completedOptions.size >= 1;
  const visibleOptions = options.filter(
    (o) => getDrillChoicePlainText(o as Record<string, unknown>).length > 0,
  );
  const choiceGap = 12;

  return (
    <View style={styles.container}>
      {hasExploredAtLeastOne && (
        <Text style={styles.hintText}>
          אפשר להמשיך לשלב הבא או לבחור שאלה נוספת
        </Text>
      )}
      <View style={[styles.optionsContainer, { gap: choiceGap }]}>
        {visibleOptions.map((option) => {
          const isCompleted = completedOptions.has(option.id);
          return (
            <Pressable
              key={option.id}
              style={[
                styles.optionCard,
                {
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                },
                isCompleted && styles.optionCardCompleted,
                isCompleted && styles.optionCardDisabled,
              ]}
              onPress={() => {
                if (!isCompleted) {
                  onOptionSelect(option.id);
                }
              }}
              disabled={isCompleted}
            >
              <DrillChoiceLabel
                choice={option}
                color={isCompleted ? "#666666" : "#0D2033"}
                style={[
                  styles.optionText,
                  isCompleted && styles.optionTextCompleted,
                ]}
              />
              {isCompleted && <Text style={styles.completedIndicator}>✓</Text>}
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
    paddingHorizontal: 4,
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
    maxWidth: 480,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#3F9FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  optionCardCompleted: {
    backgroundColor: "#F0F0F0",
    borderColor: "#CCCCCC",
    opacity: 0.6,
  },
  optionCardDisabled: {
    // Additional disabled styling if needed
  },
  optionText: {
    fontWeight: "700",
    color: "#0D2033",
    textAlign: "center",
  },
  optionTextCompleted: {
    color: "#666666",
  },
  completedIndicator: {
    position: "absolute",
    right: 16,
    fontSize: 20,
    color: "#62D24C",
    fontWeight: "800",
  },
});
