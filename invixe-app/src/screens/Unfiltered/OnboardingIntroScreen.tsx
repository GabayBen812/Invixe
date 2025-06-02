import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingIntro">;

export default function OnboardingIntroScreen({ navigation }: Props) {
  return (
    <ImageBackground source={require("../../assets/bg.png")} style={styles.bg}>
      <View style={styles.content}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>
            רגע לפני שנתחיל במסע... תן לי רגע לשאול אותך כמה שאלות
          </Text>
        </View>
        <Image
          source={require("../../assets/character.png")}
          style={styles.character}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("PhoneLogin")}
        >
          <Text style={styles.buttonText}>המשך</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: "cover" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  speechBubble: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    maxWidth: 300,
  },
  speechText: { fontSize: 18, textAlign: "center", color: "#222" },
  character: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#ff9800",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 16,
  },
  buttonText: { color: "white", fontSize: 20, fontWeight: "bold" },
});
