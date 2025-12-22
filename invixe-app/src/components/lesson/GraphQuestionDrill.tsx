import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { parseSVGCode } from '../../utils/svgParser';

export interface GraphQuestionChoice {
  id: string;
  text: string;
  correct?: boolean;
  speechbubbleText?: string;
  svgCode?: string;
  svgPublicUrl?: string | null;
  pngUrl?: string | null;
}

type MediaType = 'svg' | 'png';

interface Props {
  mediaType: MediaType;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string | null;
  pngUrl?: string | null;
  choices: GraphQuestionChoice[];
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onStateChange?: (state: { showingExplanation: boolean; canSubmit: boolean }) => void;
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onSubmit: (result: {
    correct: boolean;
    selectedChoiceId: string;
    isCorrect: boolean;
    explanation: string;
  }) => void;
}

export default function GraphQuestionDrill({
  mediaType,
  svgCode,
  svgUrl,
  svgPublicUrl,
  pngUrl,
  choices,
  submitText = 'בדוק',
  correctExplanation,
  wrongExplanation,
  onStateChange,
  onSubmitTriggerRef,
  onSubmit,
}: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Active media based on selected choice
  const activeSvgCode = useMemo(() => {
    if (mediaType !== 'svg') return undefined;
    const selected = choices.find((c) => c.id === selectedChoice);
    if (selected?.svgCode) return selected.svgCode;
    return svgCode;
  }, [mediaType, choices, selectedChoice, svgCode]);

  const activeSvgUrl = useMemo(() => {
    if (mediaType !== 'svg') return undefined;
    const selected = choices.find((c) => c.id === selectedChoice);
    if (selected?.svgPublicUrl) return selected.svgPublicUrl || undefined;
    return svgPublicUrl || svgUrl;
  }, [mediaType, choices, selectedChoice, svgPublicUrl, svgUrl]);

  const activePngUrl = useMemo(() => {
    if (mediaType !== 'png') return null;
    const selected = choices.find((c) => c.id === selectedChoice);
    if (selected?.pngUrl) return selected.pngUrl;
    return pngUrl || null;
  }, [mediaType, choices, selectedChoice, pngUrl]);

  // Fetch SVG text when only URL is available
  const [svgCache, setSvgCache] = useState<string | null>(null);

  useEffect(() => {
    if (mediaType !== 'svg') return;
    const codeToUse = activeSvgCode;
    const urlToUse = !codeToUse ? activeSvgUrl : undefined;
    if (!urlToUse) {
      setSvgCache(null);
      return;
    }

    let cancelled = false;
    const fetchSVG = async () => {
      try {
        const res = await fetch(urlToUse);
        if (!cancelled && res.ok) {
          const text = await res.text();
          setSvgCache(text);
        }
      } catch {
        if (!cancelled) setSvgCache(null);
      }
    };
    fetchSVG();
    return () => {
      cancelled = true;
    };
  }, [mediaType, activeSvgCode, activeSvgUrl]);

  const handleSubmit = () => {
    if (!selectedChoice) return;
    const selectedChoiceData = choices.find((c) => c.id === selectedChoice);
    const correct = selectedChoiceData?.correct || false;

    setSubmitted(true);
    setIsCorrect(correct);
    setShowingExplanation(true);

    const explanation = correct ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({
      correct,
      selectedChoiceId: selectedChoice,
      isCorrect: correct,
      explanation,
    });
  };

  // Expose submit handler for absolute button
  useEffect(() => {
    if (onSubmitTriggerRef) {
      onSubmitTriggerRef.current = handleSubmit;
    }
    return () => {
      if (onSubmitTriggerRef) {
        onSubmitTriggerRef.current = null;
      }
    };
  }, [onSubmitTriggerRef, handleSubmit, selectedChoice, choices, correctExplanation, wrongExplanation]);

  // Notify parent about state (used to enable/disable absolute button)
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showingExplanation,
        canSubmit: !!selectedChoice && !showingExplanation,
      });
    }
  }, [onStateChange, showingExplanation, selectedChoice]);

  // Parse SVG for rendering
  const parsedSVG = useMemo(() => {
    if (mediaType !== 'svg') return null;
    const code = activeSvgCode || svgCache;
    if (!code) return null;
    return parseSVGCode(code);
  }, [mediaType, activeSvgCode, svgCache]);

  return (
    <View style={styles.container}>
      {/* Media */}
      <View style={styles.mediaContainer}>
        {mediaType === 'svg' ? (
          parsedSVG ? (
            parsedSVG
          ) : (
            <View style={styles.mediaPlaceholder}>
              <Text style={styles.mediaPlaceholderText}>SVG</Text>
            </View>
          )
        ) : activePngUrl ? (
          <Image source={{ uri: activePngUrl } as any} style={styles.pngImage} resizeMode="contain" />
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Text style={styles.mediaPlaceholderText}>No Image</Text>
          </View>
        )}
      </View>

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {choices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          const isCorrectChoice = choice.correct;
          let buttonStyle: any = styles.choiceButton;

          if (submitted) {
            if (isSelected && isCorrectChoice) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonCorrect];
            } else if (isSelected && !isCorrectChoice) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonWrong];
            } else if (!isSelected && isCorrectChoice) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonCorrect];
            } else {
              buttonStyle = [styles.choiceButton, styles.choiceButtonDisabled];
            }
          } else if (isSelected) {
            buttonStyle = [styles.choiceButton, styles.choiceButtonSelected];
          }

          return (
            <Pressable
              key={choice.id}
              style={buttonStyle}
              onPress={() => {
                if (!submitted) {
                  setSelectedChoice(choice.id);
                }
              }}
            >
              <Text
                style={[
                  styles.choiceText,
                  (submitted || isSelected) && styles.choiceTextSelected,
                ]}
              >
                {choice.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {/* No inline submit button – submit triggered by absolute button in LessonScreen */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mediaContainer: {
    width: '94%',
    maxWidth: 480,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5EDF7',
    borderRadius: 18,
    padding: 12,
    height: 260,
    maxHeight: 260,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#D4DDEE',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 16,
  },
  pngImage: {
    width: '100%',
    height: 220,
  },
  choicesContainer: {
    width: '94%',
    maxWidth: 480,
    marginBottom: 16,
  },
  choiceButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  choiceButtonSelected: {
    borderColor: '#3372D8',
    backgroundColor: '#3372D8',
  },
  choiceButtonCorrect: {
    borderColor: '#12B76A',
    backgroundColor: '#12B76A',
  },
  choiceButtonWrong: {
    borderColor: '#D92D20',
    backgroundColor: '#FEE4E2',
  },
  choiceButtonDisabled: {
    opacity: 0.6,
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  choiceTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});



