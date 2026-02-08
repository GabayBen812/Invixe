import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
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
    <ImageBackground
      source={require("../../assets/DefaultBlankBackground.png")}
      style={styles.bg}
    >
      <View style={styles.content}>
        <Image
          source={require("../../assets/Characters/character_orange_noback.png")}
          style={styles.character}
        />
        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          placeholderTextColor="#8CA0AE"
          value={phone}
          onChangeText={setPhoneLocal}
          keyboardType="default"
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor="#8CA0AE"
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
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 16,
    textAlign: "right",
    color: "#0F2233",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: "#3372D8",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  buttonText: { color: "white", fontSize: 20, fontWeight: "bold" },
});
