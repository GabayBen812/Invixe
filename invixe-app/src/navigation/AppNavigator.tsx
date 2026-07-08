import React, { Suspense } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/Unfiltered/SplashScreen";
import WelcomeScreen from "../screens/Unfiltered/WelcomeScreen";
import LoginScreen from "../screens/Unfiltered/LoginScreen";

const MapScreen = React.lazy(() => import("../screens/MapScreen"));
const LessonScreen = React.lazy(() => import("../screens/LessonScreen"));
const LessonCompleteScreen = React.lazy(
  () => import("../screens/LessonCompleteScreen"),
);
const LessonFailScreen = React.lazy(
  () => import("../screens/LessonFailScreen"),
);
const SandboxScreen = React.lazy(() => import("../screens/SandboxScreen"));
const ProfileScreen = React.lazy(() => import("../screens/ProfileScreen"));
const ShopScreen = React.lazy(() => import("../screens/ShopScreen"));
const RegisterScreen = React.lazy(
  () => import("../screens/Unfiltered/RegisterScreen"),
);
const OnboardingIntroScreen = React.lazy(
  () => import("../screens/Unfiltered/OnboardingIntroScreen"),
);
const PhoneLoginScreen = React.lazy(
  () => import("../screens/Unfiltered/PhoneLoginScreen"),
);
const NameInputScreen = React.lazy(
  () => import("../screens/Unfiltered/NameInputScreen"),
);
const AgeSelectScreen = React.lazy(
  () => import("../screens/Unfiltered/AgeSelectScreen"),
);
const GoalSelectScreen = React.lazy(
  () => import("../screens/Unfiltered/GoalSelectScreen"),
);
const OnboardingFinishScreen = React.lazy(
  () => import("../screens/Unfiltered/OnboardingFinishScreen"),
);

function ScreenLoader() {
  return (
    <View style={loaderStyles.container}>
      <ActivityIndicator size="large" color="#3372D8" />
    </View>
  );
}

function lazyScreen<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
) {
  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OnboardingIntro: undefined;
  PhoneLogin: undefined;
  NameInput: undefined;
  AgeSelect: undefined;
  GoalSelect: undefined;
  OnboardingFinish: undefined;
  Map: { selectedUnitIdx?: number };
  Lesson: { lessonId: number; unitId?: string };
  LessonComplete: {
    lessonId: number;
    unitId?: string;
    cashEarned?: number;
    /** Cash already granted mid-lesson on correct answers. */
    alreadyAwardedCash?: number;
    correctCount?: number;
    totalGraded?: number;
    durationMs?: number;
  };
  Sandbox: { symbol?: string } | undefined;
  LessonFail: undefined;
  Profile: undefined;
  Shop: undefined;
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
        <Stack.Screen name="Register" component={lazyScreen(RegisterScreen)} />
        <Stack.Screen
          name="OnboardingIntro"
          component={lazyScreen(OnboardingIntroScreen)}
        />
        <Stack.Screen
          name="PhoneLogin"
          component={lazyScreen(PhoneLoginScreen)}
        />
        <Stack.Screen name="NameInput" component={lazyScreen(NameInputScreen)} />
        <Stack.Screen name="AgeSelect" component={lazyScreen(AgeSelectScreen)} />
        <Stack.Screen name="GoalSelect" component={lazyScreen(GoalSelectScreen)} />
        <Stack.Screen
          name="OnboardingFinish"
          component={lazyScreen(OnboardingFinishScreen)}
        />
        <Stack.Screen name="Map" component={lazyScreen(MapScreen)} />
        <Stack.Screen name="Lesson" component={lazyScreen(LessonScreen)} />
        <Stack.Screen
          name="LessonComplete"
          component={lazyScreen(LessonCompleteScreen)}
        />
        <Stack.Screen name="LessonFail" component={lazyScreen(LessonFailScreen)} />
        <Stack.Screen name="Sandbox" component={lazyScreen(SandboxScreen)} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Profile" component={lazyScreen(ProfileScreen)} />
        <Stack.Screen name="Shop" component={lazyScreen(ShopScreen)} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const loaderStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E3EEF9",
  },
});
