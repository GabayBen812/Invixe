import AppNavigator from "./src/navigation/AppNavigator";
import { RegistrationProvider } from "./context/RegistrationContext";
import { useFonts, Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Text, TextProps } from 'react-native';
import React, { useEffect } from 'react';
import { UserProvider } from './src/context/UserContext';
import { LessonsProvider } from './src/context/LessonsContext';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Custom AppText component to use Rubik font by default
export function AppText(props: TextProps) {
  return <Text {...props} style={[{ fontFamily: 'Rubik_400Regular' }, props.style]} />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <RegistrationProvider>
      <UserProvider>
        <LessonsProvider>
          <AppNavigator />
        </LessonsProvider>
      </UserProvider>
    </RegistrationProvider>
  );
}
