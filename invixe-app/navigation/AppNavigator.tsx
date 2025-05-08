import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingIntroScreen from '../screens/OnboardingIntroScreen';
import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import SplashScreen from '../screens/SplashScreen';
import AgeSelectScreen from '../screens/AgeSelectScreen';
import GoalSelectScreen from '../screens/GoalSelectScreen';
import OnboardingFinishScreen from '../screens/OnboardingFinishScreen';
import MapScreen from '../screens/MapScreen';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OnboardingIntro: undefined;
  PhoneLogin: undefined;
  AgeSelect: undefined;
  GoalSelect: undefined;
  OnboardingFinish: undefined;
  Map: undefined;
  Lesson: { lessonId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OnboardingIntro" component={OnboardingIntroScreen} />
        <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
        <Stack.Screen name="AgeSelect" component={AgeSelectScreen} />
        <Stack.Screen name="GoalSelect" component={GoalSelectScreen} />
        <Stack.Screen name="OnboardingFinish" component={OnboardingFinishScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Lesson" component={View} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 