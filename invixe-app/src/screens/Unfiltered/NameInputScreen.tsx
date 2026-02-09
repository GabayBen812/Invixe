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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { useRegistration } from "../../../context/RegistrationContext";

type Props = NativeStackScreenProps<RootStackParamList, "NameInput">;

export default function NameInputScreen({ navigation }: Props) {
  const { data, setFirstName, setLastName } = useRegistration();
  const [firstName, setFirstNameLocal] = useState(data.firstName);
  const [lastName, setLastNameLocal] = useState(data.lastName);

  const handleNext = () => {
    setFirstName(firstName.trim());
    setLastName(lastName.trim());
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
        <Text style={styles.title}>נכיר קצת יותר</Text>
        <Text style={styles.subtitle}>איך קוראים לך?</Text>
        <TextInput
          style={styles.input}
          placeholder="שם פרטי"
          placeholderTextColor="#8CA0AE"
          value={firstName}
          onChangeText={setFirstNameLocal}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="שם משפחה"
          placeholderTextColor="#8CA0AE"
          value={lastName}
          onChangeText={setLastNameLocal}
          textAlign="right"
        />
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>המשך</Text>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: "#3372D8",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#5E7686",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    width: 260,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 12,
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

