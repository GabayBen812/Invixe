import React, { useState, useEffect } from "react";
import { View, Image, Animated, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { lesson1Steps } from "../modules/lessons/1";
import { lesson2Steps } from "../modules/lessons/2";
import { LessonStep } from "../modules/lessons/types";
import Button from "../components/ui/Button";
import Inventory from "../components/lesson/Inventory";
import SpeechBubble from "../components/lesson/SpeechBubble";
import PageBackground from "../components/ui/PageBackground";
import { useUser } from '../context/UserContext';

const characterImg = require("../assets/character.png");
const backgroundImages = {
  bg1: require("../assets/Lessons/1/lesson1_bg1.png"),
  bg2: require("../assets/Lessons/1/lesson1_bg2.png"),
  bg4: require("../assets/Lessons/1/lesson1_bg4.png"),
  bg3: require("../assets/Lessons/2/lesson2_bg1.png"),
  bg5: require("../assets/Lessons/2/lesson2_bg2.png"),
  bg6: require("../assets/Lessons/2/lesson2_bg3.png"),
  bg7: require("../assets/Lessons/2/lesson2_bg4.png"),
  bg8: require("../assets/Lessons/2/lesson2_bg5.png"),
  bg9: require("../assets/Lessons/2/lesson2_bg5.png"),
  bg10: require("../assets/Lessons/2/lesson2_bg5.png"),
  bg11: require("../assets/Lessons/2/lesson2_bg5.png"),
};

type Props = NativeStackScreenProps<RootStackParamList, "Lesson">;

const lessonSteps: Record<number, LessonStep[]> = {
  1: lesson1Steps,
  2: lesson2Steps,
  // Add other lessons as they are created
};

export default function LessonScreen({ navigation, route }: Props) {
  const [stepId, setStepId] = useState("intro");
  const [fadeAnim] = useState(new Animated.Value(1));
  const lessonId = route.params?.lessonId || 1;
  const { completedLessons, setCompletedLessons } = useUser();

  useEffect(() => {
    if (route.params?.lessonId) {
      setStepId("intro");
    }
  }, [route.params?.lessonId]);

  const currentLessonSteps = lessonSteps[lessonId] || lesson1Steps;
  const step: LessonStep =
    currentLessonSteps.find((s: LessonStep) => s.id === stepId) ||
    currentLessonSteps[0];

  const handleChoice = (nextStep: string) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      if (nextStep === "map") {
        // Save progress before navigating
        if (!completedLessons.includes(lessonId)) {
          try {
            await setCompletedLessons([...completedLessons, lessonId]);
          } catch (error) {
            console.error("Failed to save progress:", error);
            // Continue with navigation even if progress save fails
          }
        }
        navigation.navigate("LessonComplete", { lessonId });
      } else {
        setStepId(nextStep);
        fadeAnim.setValue(1);
      }
    });
  };

  if (!step) {
    return (
      <PageBackground source={backgroundImages.bg1}>
        <View style={styles.content}>
          <SpeechBubble message="Loading lesson..." />
        </View>
      </PageBackground>
    );
  }

  return (
    <PageBackground source={backgroundImages[step.backgroundImage]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step.showInventory && step.inventory && (
          <Inventory inventory={step.inventory} />
        )}
        <SpeechBubble message={step.message} />
        <View style={styles.choices}>
          {step.choices?.map((choice) => (
            <Button
              key={choice.text}
              text={choice.text}
              variant={choice.style || "primary"}
              onPress={() => handleChoice(choice.nextStep)}
            />
          ))}
        </View>
        <Image source={characterImg} style={styles.character} />
      </Animated.View>
    </PageBackground>
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
  choices: {
    width: "100%",
    alignItems: "center",
  },
  character: {
    position: "absolute",
    left: 24,
    bottom: 0,
    width: 100,
    height: 120,
    resizeMode: "contain",
  },
});
