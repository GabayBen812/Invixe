import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, ImageSourcePropType, ActivityIndicator } from 'react-native';
import SpeechBubble from './SpeechBubble';

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
  characterImg?: ImageSourcePropType;
  onSubmit: (result: { 
    correct: boolean; 
    selectedChoiceId: string;
    isCorrect: boolean;
    explanation: string;
  }) => void;
}

export default function QuestionWithImage({ 
  question, 
  imageSource, 
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
            buttonStyle = styles.selectedChoice;
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
                (submitted || isSelected) && styles.selectedChoiceText
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
  },
  imageContainer: {
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
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
    backgroundColor: '#1F2937',
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
  selectedChoice: {
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
  selectedChoiceText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
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
