import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { lesson1Steps, LessonStep } from "../lessons/lesson1";
import PlaceholderBackground from "../components/PlaceholderBackground";

const characterImg = require("../assets/character.png");

type Props = NativeStackScreenProps<RootStackParamList, "Lesson">;

export default function LessonScreen({ navigation, route }: Props) {
  const [stepId, setStepId] = useState("intro");
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (route.params?.lessonId) {
      setStepId("intro");
    }
  }, [route.params?.lessonId]);

  const step: LessonStep =
    lesson1Steps.find((s) => s.id === stepId) || lesson1Steps[0];

  const handleChoice = (nextStep: string) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (nextStep === "map") {
        navigation.navigate("Map");
      } else {
        setStepId(nextStep);
        fadeAnim.setValue(1);
      }
    });
  };

  const renderInventoryItem = (label: string, count?: number) => {
    if (count === undefined) return null;
    return (
      <View style={styles.inventoryItem}>
        <Text style={styles.inventoryCount}>{count}</Text>
        <Text style={styles.inventoryLabel}>{label}</Text>
      </View>
    );
  };

  if (!step) {
    return (
      <PlaceholderBackground text="Loading..." color="#1e355e">
        <View style={styles.content}>
          <Text style={styles.speechText}>Loading lesson...</Text>
        </View>
      </PlaceholderBackground>
    );
  }

  return (
    <PlaceholderBackground text={`שלב ${step.id}`} color={step.backgroundColor}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step.showInventory && (
          <View style={styles.inventoryContainer}>
            <View style={styles.inventoryBox}>
              <Text style={styles.inventoryTitle}>מה יש ברשותך:</Text>
              <View style={styles.inventoryGrid}>
                {renderInventoryItem("גזעים", step.inventory?.logs)}
                {renderInventoryItem("לחם", step.inventory?.bread)}
                {renderInventoryItem("יין", step.inventory?.wine)}
                {renderInventoryItem("תפוזים", step.inventory?.oranges)}
              </View>
            </View>
          </View>
        )}
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{step.message}</Text>
        </View>
        <View style={styles.choices}>
          {step.choices?.map((choice) => (
            <TouchableOpacity
              key={choice.text}
              style={[
                styles.choiceBtn,
                choice.style === "primary"
                  ? styles.primary
                  : choice.style === "danger"
                  ? styles.danger
                  : styles.secondary,
              ]}
              onPress={() => handleChoice(choice.nextStep)}
            >
              <Text style={styles.choiceText}>{choice.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Image source={characterImg} style={styles.character} />
      </Animated.View>
    </PlaceholderBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
    width: "100%",
  },
  inventoryContainer: {
    position: "absolute",
    top: 80,
    width: "100%",
    alignItems: "center",
  },
  inventoryBox: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 16,
    width: "80%",
  },
  inventoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e355e",
    textAlign: "center",
    marginBottom: 12,
  },
  inventoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  inventoryItem: {
    alignItems: "center",
    minWidth: 60,
  },
  inventoryCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e355e",
  },
  inventoryLabel: {
    fontSize: 14,
    color: "#1e355e",
  },
  speechBubble: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    maxWidth: 320,
    width: "80%",
  },
  speechText: {
    fontSize: 22,
    color: "#1e355e",
    textAlign: "center",
    fontWeight: "bold",
  },
  choices: { width: "100%", alignItems: "center" },
  choiceBtn: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginVertical: 8,
    minWidth: 220,
    alignItems: "center",
  },
  primary: { backgroundColor: "#2196f3" },
  secondary: { backgroundColor: "#4caf50" },
  danger: { backgroundColor: "#f44336" },
  choiceText: { color: "white", fontSize: 20, fontWeight: "bold" },
  character: {
    position: "absolute",
    left: 24,
    bottom: 0,
    width: 100,
    height: 120,
    resizeMode: "contain",
  },
});
