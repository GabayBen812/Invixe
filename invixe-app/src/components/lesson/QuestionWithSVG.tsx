import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SvgUri } from "react-native-svg";
import { parseSVGCode } from "../../utils/svgParser";
import { fetchRemoteText } from "../../utils/remoteAssetCache";
import { useChoiceDrillLayout } from "../../hooks/useChoiceDrillLayout";
import DrillChoiceLabel from "./DrillChoiceLabel";
import {
  DRILL_MEDIA_STACK_GAP,
  getDrillChoicePlainText,
} from "../../utils/drillFitLayout";

interface Choice {
  id: string;
  text: string;
  correct: boolean;
}

interface Props {
  question: string;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string;
  choices: Choice[];
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onStateChange?: (state: {
    showingExplanation: boolean;
    canSubmit: boolean;
  }) => void;
  onSubmit: (result: {
    correct: boolean;
    selectedChoiceId: string;
    isCorrect: boolean;
    explanation: string;
  }) => void;
}

export default function QuestionWithSVG({
  question,
  svgCode,
  svgUrl,
  svgPublicUrl,
  choices,
  submitText = "בדוק",
  correctExplanation,
  wrongExplanation,
  onSubmitTriggerRef,
  onStateChange,
  onSubmit,
}: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [svgCache, setSvgCache] = useState<string | null>(null);
  const useGridLayout = choices.length > 4;
  const visibleChoices = choices.filter(
    (c) => getDrillChoicePlainText(c).length > 0,
  );
  const layout = useChoiceDrillLayout(visibleChoices.length || choices.length, {
    hasMedia: true,
    gridCols: useGridLayout ? 2 : 1,
  });
  const stackGap = DRILL_MEDIA_STACK_GAP;
  const blockMinHeight =
    layout.mediaHeight + layout.choicesMinHeight + stackGap + 16;

  const handleSubmit = () => {
    if (selectedChoice && choices && Array.isArray(choices)) {
      const selectedChoiceData = choices.find(
        (c) => c && c.id === selectedChoice,
      );
      const correct = selectedChoiceData?.correct || false;
      setSubmitted(true);
      setIsCorrect(correct);
      setShowingExplanation(true);

      // Call onSubmit immediately to trigger bottom sheet
      const explanation = correct
        ? correctExplanation || ""
        : wrongExplanation || "";
      onSubmit({
        correct,
        selectedChoiceId: selectedChoice,
        isCorrect: correct,
        explanation,
      });
    }
  };

  const handleContinue = () => {
    const selectedChoiceData = choices.find((c) => c.id === selectedChoice);
    const correct = selectedChoiceData?.correct || false;
    const explanation = correct
      ? correctExplanation || ""
      : wrongExplanation || "";
    onSubmit({
      correct,
      selectedChoiceId: selectedChoice || "",
      isCorrect: correct,
      explanation,
    });
  };

  // Fetch SVG from URL if available
  useEffect(() => {
    const fetchSVG = async () => {
      const url = svgPublicUrl || svgUrl;
      if (url && !svgCode && !svgCache) {
        try {
          const svgText = await fetchRemoteText(url);
          setSvgCache(svgText);
        } catch (error) {
          console.error("Failed to fetch SVG:", error);
        }
      }
    };
    fetchSVG();
  }, [svgPublicUrl, svgUrl, svgCode, svgCache]);

  // Expose internal submit handler so parent can trigger it (for global button)
  useEffect(() => {
    if (onSubmitTriggerRef) {
      onSubmitTriggerRef.current = handleSubmit;
    }
    return () => {
      if (onSubmitTriggerRef) {
        onSubmitTriggerRef.current = null;
      }
    };
  }, [
    onSubmitTriggerRef,
    selectedChoice,
    correctExplanation,
    wrongExplanation,
  ]);

  // Notify parent about state changes (e.g., whether user selected an option)
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showingExplanation,
        canSubmit: !!selectedChoice && !showingExplanation,
      });
    }
  }, [onStateChange, showingExplanation, selectedChoice]);

  // Render SVG using URL or parsed code
  const renderSVG = () => {
    const url = svgPublicUrl || svgUrl;
    const code = svgCode || svgCache;

    // 1. Prioritize SvgUri for URLs (most reliable)
    if (url && !svgCode) {
      return (
        <SvgUri
          uri={url}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        />
      );
    }

    // 2. Parse SVG code if available
    if (code) {
      const parsed = parseSVGCode(code);
      if (parsed) {
        return React.cloneElement(
          parsed as React.ReactElement<any>,
          {
            width: "100%",
            height: "100%",
            preserveAspectRatio: "xMidYMid meet",
          } as any,
        );
      }
    }

    // 3. No SVG available
    return null;
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: layout.containerPadding + 6,
          paddingVertical: layout.containerPadding,
          gap: stackGap,
          minHeight: blockMinHeight,
        },
      ]}
    >
      {renderSVG() && (
        <View
          style={[
            styles.svgContainer,
            { height: layout.mediaHeight },
          ]}
        >
          <View style={styles.svgWrapper}>{renderSVG()}</View>
        </View>
      )}

      <View
        style={[
          styles.choicesContainer,
          useGridLayout && styles.choicesGrid,
          { gap: layout.choiceGap, minHeight: layout.choicesMinHeight },
        ]}
      >
        {visibleChoices.map((choice) => {
            if (!choice || !choice.id) {
              console.warn("QuestionWithSVG: Invalid choice object:", choice);
              return null;
            }
            const isSelected = selectedChoice === choice.id;
            const isCorrectChoice = choice.correct;
            const labelColor =
              submitted || isSelected ? "#FFFFFF" : "#374151";
            let buttonStyle: any[] = [styles.choiceButton];

            if (submitted) {
              if (isSelected && isCorrectChoice) {
                buttonStyle = [styles.choiceButton, styles.choiceButtonCorrect];
              } else if (isSelected && !isCorrectChoice) {
                buttonStyle = [styles.choiceButton, styles.choiceButtonWrong];
              } else if (!isSelected && isCorrectChoice) {
                buttonStyle = [styles.choiceButton, styles.choiceButtonCorrect];
              }
            } else if (isSelected) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonSelected];
            }

            return (
              <Pressable
                key={choice.id}
                style={[
                  buttonStyle,
                  useGridLayout && styles.choiceButtonGrid,
                  {
                    paddingVertical: layout.choicePaddingVertical,
                    paddingHorizontal: layout.choicePaddingHorizontal,
                    marginBottom: 0,
                  },
                ]}
                onPress={() => {
                  if (!submitted) {
                    setSelectedChoice(choice.id);
                  }
                }}
              >
                <View style={styles.choiceTextWrap}>
                  <DrillChoiceLabel
                    choice={choice}
                    color={labelColor}
                    style={[
                      styles.choiceText,
                      {
                        fontSize: layout.choiceFontSize,
                        lineHeight: layout.choiceLineHeight,
                      },
                      (submitted || isSelected) && styles.choiceTextSelected,
                    ]}
                  />
                </View>
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
    flexShrink: 0,
    justifyContent: "flex-start",
  },
  svgContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flexShrink: 0,
  },
  svgWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  svgPlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#D4DDEE",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  svgPlaceholderText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 16,
  },
  choicesContainer: {
    width: "100%",
    flexShrink: 0,
  },
  choiceTextWrap: {
    width: "100%",
    alignItems: "center",
  },
  choicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: 8,
  },
  choiceButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  choiceButtonGrid: {
    width: "48%",
  },
  choiceButtonSelected: {
    borderColor: "#3F9FFF",
    backgroundColor: "#EBF4FF",
  },
  choiceButtonCorrect: {
    borderColor: "#62D24C",
    backgroundColor: "#EEF7EE",
  },
  choiceButtonWrong: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFEEEE",
  },
  choiceText: {
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
  choiceTextSelected: {
    color: "#1E40AF",
    fontWeight: "600",
  },
});
