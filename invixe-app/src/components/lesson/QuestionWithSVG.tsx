import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ImageSourcePropType } from 'react-native';
import { parseSVGCode } from '../../utils/svgParser';
import SpeechBubble from './SpeechBubble';

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
  characterImg?: ImageSourcePropType;
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
  characterImg,
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

  // Memoize SVG parsing to avoid re-parsing on every render
  const parsedSVG = useMemo(() => {
    const svgToParse = svgCode || svgCache;
    if (!svgToParse) return null;
    
    const parsed = parseSVGCode(svgToParse);
    return parsed;
  }, [svgCode, svgCache]);

  return (
    <View style={styles.container}>
      {/* Question Text in Speech Bubble */}
      <SpeechBubble
        message={question}
        characterImg={characterImg}
        position="bottomLeft"
        randomPosition={true}
        disableTyping={true}
        disableEnterAnim={false}
      />

      {/* SVG */}
      <View style={styles.svgContainer}>
        {parsedSVG || (
          <View style={styles.svgPlaceholder}>
            <Text style={styles.svgPlaceholderText}>SVG</Text>
          </View>
        )}
      </View>

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {choices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          const isCorrectChoice = choice.correct;
          let buttonStyle = styles.choiceButton;
          
          if (submitted) {
            if (isSelected && isCorrectChoice) {
              buttonStyle = styles.choiceButtonCorrect;
            } else if (isSelected && !isCorrectChoice) {
              buttonStyle = styles.choiceButtonWrong;
            } else if (!isSelected && isCorrectChoice) {
              buttonStyle = styles.choiceButtonCorrect;
            }
          } else if (isSelected) {
            buttonStyle = styles.choiceButtonSelected;
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

      {/* Submit Button */}
      <Pressable 
        style={[
          styles.submitButton,
          !selectedChoice && !showingExplanation && styles.submitButtonDisabled
        ]} 
        onPress={showingExplanation ? handleContinue : handleSubmit}
        disabled={!selectedChoice && !showingExplanation}
      >
        <Text style={styles.submitText}>
          {showingExplanation ? 'המשך' : submitText}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  svgContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  svgPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
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
    width: '100%',
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
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  choiceTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

