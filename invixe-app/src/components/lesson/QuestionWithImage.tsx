import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';

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
  onSubmit: (result: { correct: boolean; selectedChoiceId: string }) => void;
}

export default function QuestionWithImage({ 
  question, 
  imageSource, 
  choices, 
  submitText = 'בדוק', 
  onSubmit 
}: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedChoice) {
      const selectedChoiceData = choices.find(c => c.id === selectedChoice);
      onSubmit({ 
        correct: selectedChoiceData?.correct || false, 
        selectedChoiceId: selectedChoice 
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Question Text */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question}</Text>
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      </View>

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {choices.map((choice) => (
          <Pressable
            key={choice.id}
            style={[
              styles.choiceButton,
              selectedChoice === choice.id && styles.selectedChoice
            ]}
            onPress={() => setSelectedChoice(choice.id)}
          >
            <Text style={[
              styles.choiceText,
              selectedChoice === choice.id && styles.selectedChoiceText
            ]}>
              {choice.text}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Submit Button */}
      <Pressable 
        style={[
          styles.submitButton,
          !selectedChoice && styles.submitButtonDisabled
        ]} 
        onPress={handleSubmit}
        disabled={!selectedChoice}
      >
        <Text style={styles.submitText}>{submitText}</Text>
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
  questionContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 24,
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
