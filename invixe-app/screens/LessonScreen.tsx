import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { lesson1Steps, LessonStep } from '../lessons/lesson1';

const characterImg = require('../assets/character.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

export default function LessonScreen({ navigation, route }: Props) {
  const [stepId, setStepId] = useState('start');
  const [fadeAnim] = useState(new Animated.Value(1));
  const step: LessonStep = lesson1Steps.find(s => s.id === stepId) || lesson1Steps[0];

  const handleChoice = (nextStep: string) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      if (nextStep === 'map') {
        navigation.navigate('Map');
      } else {
        setStepId(nextStep);
        fadeAnim.setValue(1);
      }
    });
  };

  return (
    <ImageBackground source={step.image} style={styles.bg}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>  
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{step.message}</Text>
        </View>
        <View style={styles.choices}>
          {step.choices.map((choice, idx) => (
            <TouchableOpacity
              key={choice.text}
              style={[styles.choiceBtn, choice.style === 'primary' ? styles.primary : choice.style === 'danger' ? styles.danger : styles.secondary]}
              onPress={() => handleChoice(choice.nextStep)}
            >
              <Text style={styles.choiceText}>{choice.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Image source={characterImg} style={styles.character} />
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: 'cover' },
  content: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 },
  speechBubble: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16, padding: 18, marginBottom: 24, maxWidth: 320 },
  speechText: { fontSize: 22, color: 'white', textAlign: 'center', fontWeight: 'bold' },
  choices: { width: '100%', alignItems: 'center' },
  choiceBtn: { borderRadius: 24, paddingVertical: 14, paddingHorizontal: 40, marginVertical: 8, minWidth: 220, alignItems: 'center' },
  primary: { backgroundColor: '#2196f3' },
  secondary: { backgroundColor: '#4caf50' },
  danger: { backgroundColor: '#f44336' },
  choiceText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  character: { position: 'absolute', left: 24, bottom: 0, width: 100, height: 120, resizeMode: 'contain' },
}); 