import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useRegistration } from "../../../context/RegistrationContext";

type Props = NativeStackScreenProps<RootStackParamList, "PhoneLogin">;

export default function PhoneLoginScreen({ navigation }: Props) {
  const { setPhone, setPassword, data } = useRegistration();
  const [phone, setPhoneLocal] = useState(data.phone);
  const [password, setPasswordLocal] = useState(data.password);

  const handleNext = () => {
    setPhone(phone);
    setPassword(password);
    navigation.navigate("AgeSelect");
  };

  return (
    <ImageBackground source={require("../../assets/bg.png")} style={styles.bg}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/character.png")}
          style={styles.character}
        />
        <TextInput
          style={styles.input}
          placeholder="מספר טלפון"
          placeholderTextColor="#ccc"
          value={phone}
          onChangeText={setPhoneLocal}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor="#ccc"
          value={password}
          onChangeText={setPasswordLocal}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>התחבר</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: "cover" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  character: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 32,
  },
  input: {
    width: 260,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 18,
    marginBottom: 16,
    textAlign: "right",
  },
  button: {
    backgroundColor: "#ff9800",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  buttonText: { color: "white", fontSize: 20, fontWeight: "bold" },
});
