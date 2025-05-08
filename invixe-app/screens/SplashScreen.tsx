import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground source={require('../assets/bg.png')} style={styles.bg}>
      <View style={styles.content}>
        <Image source={require('../assets/character.png')} style={styles.character} />
        <Text style={styles.title}>Invixe</Text>
        <ActivityIndicator size="large" color="#ff9800" style={{ marginTop: 24 }} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: 'cover' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  character: { width: 180, height: 180, resizeMode: 'contain', marginBottom: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: 'white', textShadowColor: '#222', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 6 },
}); 