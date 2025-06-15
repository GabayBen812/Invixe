import AppNavigator from "./src/navigation/AppNavigator";
import { RegistrationProvider } from "./context/RegistrationContext";
import { useFonts, Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';
import AppLoading from 'expo-app-loading';
import { Text, TextProps } from 'react-native';
import React from 'react';
import { UserProvider } from './src/context/UserContext';

// Custom AppText component to use Rubik font by default
export function AppText(props: TextProps) {
  return <Text {...props} style={[{ fontFamily: 'Rubik_400Regular' }, props.style]} />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <RegistrationProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </RegistrationProvider>
  );
}
