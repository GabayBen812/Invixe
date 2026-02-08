import AppNavigator from "./src/navigation/AppNavigator";
import { RegistrationProvider } from "./context/RegistrationContext";
import {
  useFonts,
  Rubik_400Regular,
  Rubik_700Bold,
} from "@expo-google-fonts/rubik";
import { Text, TextProps } from "react-native";
import React, { useEffect, useState } from "react";
import { UserProvider } from "./src/context/UserContext";
import { LessonsProvider } from "./src/context/LessonsContext";
import { DictionaryProvider } from "./src/context/DictionaryContext";
import DictionaryDrawer from "./src/components/dictionary/DictionaryDrawer";
import * as SplashScreen from "expo-splash-screen";
import ErrorBoundary from "./src/components/ErrorBoundary";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Custom AppText component to use Rubik font by default
export function AppText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[{ fontFamily: "Rubik_400Regular" }, props.style]}
    />
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });
  const [fontLoadError, setFontLoadError] = useState<Error | null>(null);
  const [fontFallbackReady, setFontFallbackReady] = useState(false);

  // Safety: if fonts fail or take too long, continue app render so we don't stay blank
  useEffect(() => {
    const timer = setTimeout(() => setFontFallbackReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontLoadError || fontFallbackReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontLoadError, fontFallbackReady]);

  // Capture font load errors (useFonts only exposes via console.warn)
  useEffect(() => {
    if (!fontsLoaded && !fontLoadError) {
      // noop: useFonts doesn't expose error directly; fallback handles the blank issue.
    }
  }, [fontsLoaded, fontLoadError]);

  if (!fontsLoaded && !fontFallbackReady) return null;

  return (
    <RegistrationProvider>
      <UserProvider>
        <LessonsProvider>
          <DictionaryProvider>
            <ErrorBoundary>
              <AppNavigator />
              <DictionaryDrawer />
            </ErrorBoundary>
          </DictionaryProvider>
        </LessonsProvider>
      </UserProvider>
    </RegistrationProvider>
  );
}
