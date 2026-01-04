import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from 'react-native';

interface Choice {
  id: string;
  text: string;
  correct: boolean;
}

interface Props {
  question: string;
  imageSource: any; // Image source (require() or {uri: ''})
  choices: Choice[];
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onSubmit: (result: { 
    correct: boolean; 
    selectedChoiceId: string;
    isCorrect: boolean;
    explanation: string;
  }) => void;
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onStateChange?: (state: { showingExplanation: boolean; canSubmit: boolean }) => void;
}

export default function QuestionWithImage({ 
  question, 
  imageSource, 
  choices, 
  submitText = 'בדוק',
  correctExplanation,
  wrongExplanation,
  onSubmit,
  onSubmitTriggerRef,
  onStateChange
}: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Preload image when component mounts
  useEffect(() => {
    if (imageSource && typeof imageSource === 'object' && imageSource.uri) {
      Image.prefetch(imageSource.uri)
        .then(() => setImageLoading(false))
        .catch(() => setImageLoading(false));
    } else {
      setImageLoading(false);
    }
  }, [imageSource]);

  const handleSubmit = () => {
    if (selectedChoice) {
      const selectedChoiceData = choices.find(c => c.id === selectedChoice);
      const correct = selectedChoiceData?.correct || false;
      const explanation = correct ? (correctExplanation || '') : (wrongExplanation || '');
      setSubmitted(true);
      setIsCorrect(correct);
      setShowingExplanation(true);
      // Immediately call onSubmit to show bottom sheet
      onSubmit({ 
        correct,
        selectedChoiceId: selectedChoice || '',
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

  // Expose submit handler for global button
  useEffect(() => {
    if (onSubmitTriggerRef) {
      onSubmitTriggerRef.current = () => {
        // Only handle submit if we haven't submitted yet
        // After submission, the bottom sheet will handle continuation
        if (!showingExplanation && selectedChoice) {
          handleSubmit();
        }
      };
    }
    return () => {
      if (onSubmitTriggerRef) {
        onSubmitTriggerRef.current = null;
      }
    };
  }, [onSubmitTriggerRef, showingExplanation, selectedChoice, correctExplanation, wrongExplanation]);

  // Notify parent about state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showingExplanation,
        canSubmit: !!selectedChoice && !showingExplanation,
      });
    }
  }, [onStateChange, showingExplanation, selectedChoice]);

  return (
    <View style={styles.container}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.imageLoadingContainer}>
            <ActivityIndicator size="large" color="#3F9FFF" />
          </View>
        )}
        <Image 
          source={imageSource} 
          style={[styles.image, imageLoading && styles.imageHidden]} 
          resizeMode="contain"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
      </View>

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {choices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          const isCorrectChoice = choice.correct;
          let buttonStyle: any[] = [styles.choiceButton];
          let textStyle: any[] = [styles.choiceText];
          
          if (submitted) {
            if (isSelected && isCorrectChoice) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonCorrect];
              textStyle = [styles.choiceText, styles.choiceTextCorrect];
            } else if (isSelected && !isCorrectChoice) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonWrong];
              textStyle = [styles.choiceText, styles.choiceTextWrong];
            } else if (!isSelected && isCorrectChoice) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonCorrect];
              textStyle = [styles.choiceText, styles.choiceTextCorrect];
            } else {
              buttonStyle = [styles.choiceButton, styles.choiceButtonDisabled];
              textStyle = [styles.choiceText, styles.choiceTextDisabled];
            }
          } else if (isSelected) {
            buttonStyle = [styles.choiceButton, styles.choiceButtonSelected];
            textStyle = [styles.choiceText, styles.choiceTextSelected];
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
              <Text style={textStyle}>
                {choice.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  imageContainer: {
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
  },
  image: {
    width: '100%',
    maxWidth: 400,
    height: 250,
    maxHeight: 300,
  },
  imageHidden: {
    opacity: 0,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  choicesContainer: {
    marginBottom: 24,
  },
  choiceButton: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginVertical: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  choiceButtonSelected: {
    backgroundColor: '#3372D8',
    shadowColor: '#3F9FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  choiceButtonCorrect: {
    backgroundColor: '#12B76A',
  },
  choiceButtonWrong: {
    backgroundColor: '#FF6B6B',
  },
  choiceButtonDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  choiceText: {
    color: '#0D2033',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  choiceTextSelected: {
    color: '#FFFFFF',
  },
  choiceTextCorrect: {
    color: '#FFFFFF',
  },
  choiceTextWrong: {
    color: '#FFFFFF',
  },
  choiceTextDisabled: {
    color: '#9CA3AF',
  },
});
