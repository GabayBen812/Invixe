import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useRegistration } from '../context/RegistrationContext';

const goals = [
  { label: 'איך הכסף עובד?', icon: require('../assets/character.png') },
  { label: 'להשקיע לטווח ארוך ולקרוא גרפים', icon: require('../assets/character.png') },
  { label: 'מסחר יומי', icon: require('../assets/character.png') },
];

type Props = NativeStackScreenProps<RootStackParamList, 'GoalSelect'>;

export default function GoalSelectScreen({ navigation }: Props) {
  const { setGoal } = useRegistration();
  const handleSelect = (goal: string) => {
    setGoal(goal);
    navigation.navigate('OnboardingFinish');
  };
  return (
    <ImageBackground source={require('../assets/bg.png')} style={styles.bg}>
      <View style={styles.content}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>אז מה חשוב לך ללמוד?</Text>
        </View>
        <Image source={require('../assets/character.png')} style={styles.character} />
        <View style={styles.choices}>
          {goals.map((goal, idx) => (
            <TouchableOpacity
              key={goal.label}
              style={styles.choice}
              onPress={() => handleSelect(goal.label)}
            >
              <Image source={goal.icon} style={styles.icon} />
              <Text style={styles.choiceText}>{goal.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: 'cover' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  speechBubble: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, maxWidth: 300 },
  speechText: { fontSize: 18, textAlign: 'center', color: '#222' },
  character: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 16 },
  choices: { width: '100%', alignItems: 'center' },
  choice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e355e', borderRadius: 16, padding: 12, marginVertical: 6, width: 260 },
  icon: { width: 32, height: 32, marginRight: 16 },
  choiceText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
}); 