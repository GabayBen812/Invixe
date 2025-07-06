import React, { useState, useEffect } from "react";
import { View, Image, Animated, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { lessonSteps as lesson1Steps } from "../modules/lessons/step1/lesson1";
import { lessonSteps as lesson2Steps } from "../modules/lessons/step2/lesson1";
import { lessonSteps as lesson101Steps } from "../modules/lessons/step1/lesson101";
import { LessonStep } from "../modules/lessons/types";
import Button from "../components/ui/Button";
import Inventory from "../components/lesson/Inventory";
import SpeechBubble from "../components/lesson/SpeechBubble";
import PageBackground from "../components/ui/PageBackground";
import { useUser } from '../context/UserContext';
import TopBar from '../components/ui/TopBar';
import { HammerCandleSVG, BullishCandleSVG, BearishCandleSVG, DojiCandleSVG } from '../components/lesson/CandlestickSVGs';

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

const characterImages: { [key: string]: any } = {
  "character_orange_yellow.png": require("../assets/Characters/character_orange_yellow.png"),
  "character_blue_yellow.png": require("../assets/Characters/character_blue_yellow.png"),
  "character_green_yellow.png": require("../assets/Characters/character_green_yellow.png"),
  "character_yellow_darkblue.png": require("../assets/Characters/character_yellow_darkblue.png"),
  "character_blue_darkblue.png": require("../assets/Characters/character_blue_darkblue.png"),
  "character_green_darkblue.png": require("../assets/Characters/character_green_darkblue.png"),
  "character_yellow_orange.png": require("../assets/Characters/character_yellow_orange.png"),
  "character_blue_orange.png": require("../assets/Characters/character_blue_orange.png"),
  "character_green_orange.png": require("../assets/Characters/character_green_orange.png"),
  "character_yellow_blue.png": require("../assets/Characters/character_yellow_blue.png"),
  "character_orange_blue.png": require("../assets/Characters/character_orange_blue.png"),
  "character_green_blue.png": require("../assets/Characters/character_green_blue.png"),
  "character_yellow_white.png": require("../assets/Characters/character_yellow_white.png"),
  "character_blue_white.png": require("../assets/Characters/character_blue_white.png"),
  "character_green_white.png": require("../assets/Characters/character_green_white.png"),
};

type Props = NativeStackScreenProps<RootStackParamList, "Lesson">;

const lessonSteps: Record<number, LessonStep[]> = {
  1: lesson1Steps,
  2: lesson2Steps,
  101: lesson101Steps,
  // Add other lessons as they are created
};

// Character image resolver
function getCharacterImg(characterImgKey?: string) {
  if (characterImgKey && characterImages[characterImgKey]) {
    return characterImages[characterImgKey];
  }
  return require('../assets/character.png');
}

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
    // If the next step is a known fail step, navigate to fail immediately
    if (nextStep === 'wrong1') {
      navigation.navigate('LessonFail');
      return;
    }
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      if (nextStep === "map") {
        let shouldComplete = true;
        let shouldFail = false;
        // Special logic for quiz lesson: only complete if user answered correctly
        if (lessonId === 101) {
          if (stepId === "wrong1") {
            shouldComplete = false;
            shouldFail = true;
          }
        }
        if (shouldFail) {
          navigation.navigate("LessonFail");
          return;
        }
        if (shouldComplete && !completedLessons.includes(lessonId)) {
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

  const choices = step.choices;

  return (
    <View style={{ flex: 1, backgroundColor: '#D3E9FF' }}>
      <TopBar />
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {`${currentLessonSteps.findIndex(s => s.id === stepId) + 1}/${currentLessonSteps.length}`}
        </Text>
        <View style={styles.progressBarBg}>
          <View style={{
            width: `${((currentLessonSteps.findIndex(s => s.id === stepId) + 1) / currentLessonSteps.length) * 100}%`,
            height: '100%',
            backgroundColor: '#4CD964',
            borderRadius: 8,
          }} />
        </View>
      </View>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>        
        {step.showInventory && step.inventory && (
          <Inventory inventory={step.inventory} />
        )}
        <View style={styles.bubbleWrapper}>
          <SpeechBubble 
            message={step.message} 
            characterImg={getCharacterImg(step.characterImg)} 
            position={step.bubblePosition || 'bottomLeft'}
            align={step.bubblePosition?.includes('Right') ? 'flex-end' : step.bubblePosition?.includes('Left') ? 'flex-start' : 'center'}
            buttonText={choices && choices.length === 1 ? choices[0].text : undefined}
            onButtonPress={choices && choices.length === 1 ? () => handleChoice(choices[0].nextStep) : undefined}
          />
          {/* Render candlestick SVG if visual is set */}
          {step.visual === 'hammer' && (
            <View style={styles.candleSvgWrapper}><HammerCandleSVG width={60} height={120} /></View>
          )}
          {step.visual === 'bullish' && (
            <View style={styles.candleSvgWrapper}><BullishCandleSVG width={36} height={110} /></View>
          )}
          {step.visual === 'bearish' && (
            <View style={styles.candleSvgWrapper}><BearishCandleSVG width={36} height={110} /></View>
          )}
          {step.visual === 'doji' && (
            <View style={styles.candleSvgWrapper}><DojiCandleSVG width={50} height={80} /></View>
          )}
        </View>
        <View style={styles.choices}>
          {choices && choices.length > 1
            ? choices.map((choice) => (
                <Button
                  key={choice.text}
                  text={choice.text}
                  variant={choice.style || "primary"}
                  onPress={() => handleChoice(choice.nextStep)}
                  style={styles.choiceButton}
                />
              ))
            : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
    width: "100%",
    paddingHorizontal: 8,
  },
  bubbleWrapper: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    marginBottom: 0,
  },
  choices: {
    width: "100%",
    alignItems: "center",
    maxWidth: 500,
    alignSelf: 'center',
    marginTop: 8,
  },
  choiceButton: {
    maxWidth: '95%',
    width: 340,
    alignSelf: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e355e',
    marginBottom: 2,
    textAlign: 'center',
  },
  progressBarBg: {
    width: 180,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  character: {
    position: "absolute",
    left: 24,
    bottom: 0,
    width: 100,
    height: 120,
    resizeMode: "contain",
  },
  candleSvgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});
