import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useRegistration } from '../context/RegistrationContext';

const ageGroups = [
  { label: '16 - 21', icon: require('../assets/character.png') },
  { label: '21 - 34', icon: require('../assets/character.png') },
  { label: '34 - 49', icon: require('../assets/character.png') },
  { label: '50+', icon: require('../assets/character.png') },
];

type Props = NativeStackScreenProps<RootStackParamList, 'AgeSelect'>;

export default function AgeSelectScreen({ navigation }: Props) {
  const { setAgeGroup } = useRegistration();
  const handleSelect = (age: string) => {
    setAgeGroup(age);
    navigation.navigate('GoalSelect');
  };
  return (
    <ImageBackground source={require('../assets/bg.png')} style={styles.bg}>
      <View style={styles.content}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>באיזה טווח גילאים אתה?</Text>
        </View>
        <Image source={require('../assets/character.png')} style={styles.character} />
        <View style={styles.choices}>
          {ageGroups.map((group, idx) => (
            <TouchableOpacity
              key={group.label}
              style={styles.choice}
              onPress={() => handleSelect(group.label)}
            >
              <Image source={group.icon} style={styles.icon} />
              <Text style={styles.choiceText}>{group.label}</Text>
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
  choiceText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
}); 