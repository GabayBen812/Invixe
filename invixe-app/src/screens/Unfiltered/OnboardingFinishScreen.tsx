import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useRegistration } from "../../../context/RegistrationContext";

const API_URL = "http://10.0.0.52:4000/api/register"; // Change to your backend URL

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingFinish">;

export default function OnboardingFinishScreen({ navigation }: Props) {
  const { data, reset } = useRegistration();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Registration failed");
      setSuccess(true);
      reset();
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require("../../assets/bg.png")} style={styles.bg}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/character.png")}
          style={styles.character}
        />
        <Text style={styles.title}>ברוך הבא להרפתקה של Invixe!</Text>
        <Text style={styles.subtitle}>
          ההרפתקה שלך בלמידת שוק ההון מתחילה עכשיו 🚀
        </Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#ff9800"
            style={{ marginTop: 24 }}
          />
        ) : success ? (
          <>
            <Text style={styles.success}>נרשמת בהצלחה!</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Welcome")}
            >
              <Text style={styles.buttonText}>התחל ללמוד</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>סיים והרשם</Text>
          </TouchableOpacity>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: "cover" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  character: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "#222",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 24,
    textShadowColor: "#222",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: "#ff9800",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 16,
  },
  buttonText: { color: "white", fontSize: 20, fontWeight: "bold" },
  success: {
    color: "#4caf50",
    fontSize: 20,
    marginTop: 16,
    fontWeight: "bold",
  },
  error: { color: "#f44336", fontSize: 16, marginTop: 12 },
});
