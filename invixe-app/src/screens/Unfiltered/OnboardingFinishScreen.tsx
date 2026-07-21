import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useRegistration } from "../../../context/RegistrationContext";
import { useUser } from "../../context/UserContext";

import { API_BASE_URL } from "../../config/api";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";

const API_URL = `${API_BASE_URL}/register`;

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingFinish">;

export default function OnboardingFinishScreen({ navigation }: Props) {
  const { data, reset } = useRegistration();
  const { setCurrentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithTimeout(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Registration failed");

      const resBody = await res.json().catch(() => ({}));

      // Set the current user immediately
      await setCurrentUser(data.phone, {
        firstName: resBody.firstName ?? data.firstName,
        lastName: resBody.lastName ?? data.lastName,
      });

      setSuccess(true);
      reset();
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/DefaultBlankBackground.png")}
      style={styles.bg}
    >
      <View style={styles.content}>
        <Image
          source={require("../../assets/Characters/character_orange_noback.png")}
          style={styles.character}
        />
        <Text style={styles.title}>ברוך הבא להרפתקה של Invixe!</Text>
        <Text style={styles.subtitle}>
          ההרפתקה שלך בלמידת שוק ההון מתחילה עכשיו 🚀
        </Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#3372D8"
            style={{ marginTop: 24 }}
          />
        ) : success ? (
          <>
            <Text style={styles.success}>נרשמת בהצלחה!</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.reset({ index: 0, routes: [{ name: "Map", params: {} }] })
              }
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  character: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#3372D8",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#5E7686",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#3372D8",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 16,
  },
  buttonText: { color: "white", fontSize: 20, fontWeight: "bold" },
  success: {
    color: "#12B76A",
    fontSize: 20,
    marginTop: 16,
    fontWeight: "bold",
  },
  error: { color: "#D92D20", fontSize: 16, marginTop: 12 },
});
