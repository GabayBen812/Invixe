import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export interface PathOption {
  id: string;
  text: string;
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
  const allCompleted =
    options.length > 0 && options.every((opt) => completedOptions.has(opt.id));

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isCompleted = completedOptions.has(option.id);

          return (
            <Pressable
              key={option.id}
              style={[
                styles.optionCard,
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
              <Text
                style={[
                  styles.optionText,
                  isCompleted && styles.optionTextCompleted,
                ]}
              >
                {option.text}
              </Text>
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
    paddingHorizontal: 16,
  },
  optionsContainer: {
    width: "100%",
    maxWidth: 480,
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "#3F9FFF",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
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
    fontSize: 16,
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
