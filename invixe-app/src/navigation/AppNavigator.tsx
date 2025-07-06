import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/Unfiltered/WelcomeScreen";
import LoginScreen from "../screens/Unfiltered/LoginScreen";
import RegisterScreen from "../screens/Unfiltered/RegisterScreen";
import OnboardingIntroScreen from "../screens/Unfiltered/OnboardingIntroScreen";
import PhoneLoginScreen from "../screens/Unfiltered/PhoneLoginScreen";
import SplashScreen from "../screens/Unfiltered/SplashScreen";
import AgeSelectScreen from "../screens/Unfiltered/AgeSelectScreen";
import GoalSelectScreen from "../screens/Unfiltered/GoalSelectScreen";
import OnboardingFinishScreen from "../screens/Unfiltered/OnboardingFinishScreen";
import MapScreen from "../screens/MapScreen";
import LessonScreen from "../screens/LessonScreen";
import LessonCompleteScreen from "../screens/LessonCompleteScreen";
import SandboxScreen from "../screens/SandboxScreen";
import LessonFailScreen from "../screens/LessonFailScreen";

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
  LessonComplete: { lessonId: number };
  Sandbox: undefined;
  LessonFail: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="OnboardingIntro"
          component={OnboardingIntroScreen}
        />
        <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
        <Stack.Screen name="AgeSelect" component={AgeSelectScreen} />
        <Stack.Screen name="GoalSelect" component={GoalSelectScreen} />
        <Stack.Screen
          name="OnboardingFinish"
          component={OnboardingFinishScreen}
        />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Lesson" component={LessonScreen} />
        <Stack.Screen name="LessonComplete" component={LessonCompleteScreen} />
        <Stack.Screen name="LessonFail" component={LessonFailScreen} />
        <Stack.Screen name="Sandbox" component={SandboxScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
