import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { parseSVGCode } from '../../utils/svgParser';

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
  onStateChange?: (state: { showingExplanation: boolean; canSubmit: boolean }) => void;
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
  submitText = 'בדוק',
  correctExplanation,
  wrongExplanation,
  onSubmitTriggerRef,
  onStateChange,
  onSubmit 
}: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [svgCache, setSvgCache] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedChoice) {
      const selectedChoiceData = choices.find(c => c.id === selectedChoice);
      const correct = selectedChoiceData?.correct || false;
      setSubmitted(true);
      setIsCorrect(correct);
      setShowingExplanation(true);

      // Call onSubmit immediately to trigger bottom sheet
      const explanation = correct ? (correctExplanation || '') : (wrongExplanation || '');
      onSubmit({ 
        correct,
        selectedChoiceId: selectedChoice,
        isCorrect: correct,
        explanation
      });
    }
  };

  const handleContinue = () => {
    const selectedChoiceData = choices.find(c => c.id === selectedChoice);
    const correct = selectedChoiceData?.correct || false;
    const explanation = correct ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({ 
      correct,
      selectedChoiceId: selectedChoice || '',
      isCorrect: correct,
      explanation
    });
  };

  // Fetch SVG from URL if available
  useEffect(() => {
    const fetchSVG = async () => {
      const url = svgPublicUrl || svgUrl;
      if (url && !svgCode && !svgCache) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const svgText = await response.text();
            setSvgCache(svgText);
          }
        } catch (error) {
          console.error('Failed to fetch SVG:', error);
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
  }, [onSubmitTriggerRef, handleSubmit, selectedChoice, choices, correctExplanation, wrongExplanation]);

  // Notify parent about state changes (e.g., whether user selected an option)
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showingExplanation,
        canSubmit: !!selectedChoice && !showingExplanation,
      });
    }
  }, [onStateChange, showingExplanation, selectedChoice]);


  // Memoize SVG parsing to avoid re-parsing on every render
  const parsedSVG = useMemo(() => {
    const svgToParse = svgCode || svgCache;
    if (!svgToParse) {
      console.log('QuestionWithSVG: No SVG code to parse');
      return null;
    }
    
    console.log('QuestionWithSVG: Parsing SVG, length:', svgToParse.length);
    const parsed = parseSVGCode(svgToParse);
    console.log('QuestionWithSVG: Parsed SVG result:', parsed ? 'success' : 'failed');
    return parsed;
  }, [svgCode, svgCache]);

  return (
    <View style={styles.container}>
      {/* SVG */}
      <View style={styles.svgContainer}>
        {parsedSVG ? (
          parsedSVG
        ) : (
          <View style={styles.svgPlaceholder}>
            <Text style={styles.svgPlaceholderText}>SVG</Text>
          </View>
        )}
      </View>

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {choices && Array.isArray(choices) && choices.map((choice) => {
          if (!choice || !choice.id) {
            console.warn('QuestionWithSVG: Invalid choice object:', choice);
            return null;
          }
          const isSelected = selectedChoice === choice.id;
          const isCorrectChoice = choice.correct;
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
              style={buttonStyle}
              onPress={() => {
                if (!submitted) {
                  setSelectedChoice(choice.id);
                }
              }}
            >
              <Text style={[
                styles.choiceText,
                (submitted || isSelected) && styles.choiceTextSelected
              ]}>
                {choice.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Reserve space for global continue button (always reserve space even if not visible) */}
      <View style={styles.buttonArea} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  svgContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 400,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  svgPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#D4DDEE',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgPlaceholderText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 16,
  },
  choicesContainer: {
    marginBottom: 24,
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
    borderColor: '#3F9FFF',
    backgroundColor: '#EBF4FF',
  },
  choiceButtonCorrect: {
    borderColor: '#62D24C',
    backgroundColor: '#EEF7EE',
  },
  choiceButtonWrong: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFEEEE',
  },
  choiceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  choiceTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  buttonArea: {
    minHeight: 120,
    width: '100%',
  },
});

