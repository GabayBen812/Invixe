import React, { useState, useEffect } from "react";
import { View, Image, Animated, StyleSheet, Text, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { lessonSteps as lesson101Steps } from "../modules/lessons/step1/lesson101";
import { lessonSteps as lesson301Steps } from "../modules/lessons/step1/lesson301";
import { lessonSteps as lesson302Steps } from "../modules/lessons/step1/lesson302";
import { lessonSteps as lesson303Steps } from "../modules/lessons/step1/lesson303";
import { lessonSteps as lesson304Steps } from "../modules/lessons/step1/lesson304";
import { lessonSteps as lesson305Steps } from "../modules/lessons/step1/lesson305";
import { lessonSteps as lesson306Steps } from "../modules/lessons/step1/lesson306";
import { lessonSteps as lesson307Steps } from "../modules/lessons/step1/lesson307";
import { lessonSteps as lesson308Steps } from "../modules/lessons/step1/lesson308";
import { lessonSteps as lesson309Steps } from "../modules/lessons/step1/lesson309";
import { lessonSteps as lesson310Steps } from "../modules/lessons/step1/lesson310";
import { lessonSteps as lesson201Steps } from "../modules/lessons/step1/lesson201";
import { lessonSteps as lesson202Steps } from "../modules/lessons/step1/lesson202";
import { lessonSteps as lesson203Steps } from "../modules/lessons/step1/lesson203";
import { lessonSteps as lesson204Steps } from "../modules/lessons/step1/lesson204";
import { lessonSteps as lesson205Steps } from "../modules/lessons/step1/lesson205";
import { lessonSteps as lesson401Steps } from "../modules/lessons/step1/lesson401";
import { lessonSteps as lesson402Steps } from "../modules/lessons/step1/lesson402";
import { lessonSteps as lesson403Steps } from "../modules/lessons/step1/lesson403";
import { lessonSteps as lesson404Steps } from "../modules/lessons/step1/lesson404";
import { lessonSteps as lesson405Steps } from "../modules/lessons/step1/lesson405";
import { LessonStep } from "../modules/lessons/types";
import Button from "../components/ui/Button";
import Inventory from "../components/lesson/Inventory";
import SpeechBubble from "../components/lesson/SpeechBubble";
import PageBackground from "../components/ui/PageBackground";
import { useUser } from '../context/UserContext';
import TopBar from '../components/ui/TopBar';
import { HammerCandleSVG, BullishCandleSVG, BearishCandleSVG, DojiCandleSVG } from '../components/lesson/CandlestickSVGs';
import {
  DragonflyDoji,
  Hammer,
  LongLeggedDoji,
  GravestoneDoji,
  InvertedHammer,
  Doji,
  BullishEngulfing,
  BearishEngulfing,
  ShootingStar,
  RegularDoji,
  InvertedHammerNew
} from '../assets/Candels';
import DojiLessonVisuals from '../components/lesson/DojiLessonVisuals';
import MultiSelectDrill from '../components/lesson/MultiSelectDrill';
import CarouselSelectDrill from '../components/lesson/CarouselSelectDrill';
import DragMatchDrill from '../components/lesson/DragMatchDrill';
import SequenceBuildDrill from '../components/lesson/SequenceBuildDrill';

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
  "character_orange_noback.png": require("../assets/Characters/character_orange_noback.png"),
};

type Props = NativeStackScreenProps<RootStackParamList, "Lesson">;

const lessonSteps: Record<number, LessonStep[]> = {
  101: lesson101Steps,
  301: lesson301Steps,
  201: lesson201Steps,
  202: lesson202Steps,
  203: lesson203Steps,
  204: lesson204Steps,
  205: lesson205Steps,
  302: lesson302Steps,
  303: lesson303Steps,
  304: lesson304Steps,
  305: lesson305Steps,
  306: lesson306Steps,
  307: lesson307Steps,
  308: lesson308Steps,
  309: lesson309Steps,
  310: lesson310Steps,
  401: lesson401Steps,
  402: lesson402Steps,
  403: lesson403Steps,
  404: lesson404Steps,
  405: lesson405Steps,
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
  const { completedLessons, markLessonCompleted, setCompletedLessons, lightnings, setLightnings } = useUser();
  const [showCorrectOverlay, setShowCorrectOverlay] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<string | null>(null);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [answerMode, setAnswerMode] = useState<'none' | 'correct'>('none');
  const [drillRewards, setDrillRewards] = useState<number>(0);

  useEffect(() => {
    if (route.params?.lessonId) {
      setStepId("intro");
    }
  }, [route.params?.lessonId]);

  const currentLessonSteps = lessonSteps[lessonId] || [];
  const step: LessonStep =
    currentLessonSteps.find((s: LessonStep) => s.id === stepId) ||
    currentLessonSteps[0];

  const handleChoice = (nextStep: string) => {
    // If the next step is a known fail step, navigate to fail immediately
    if (nextStep === 'wrong1') {
      navigation.navigate('LessonFail');
      return;
    }
    
    // Check if this step has points (correct answer) and should show bottom sheet
    const nextStepData = currentLessonSteps.find(s => s.id === nextStep);
    if (nextStepData && nextStepData.points && nextStepData.points > 0) {
      // Show overlay but DON'T advance to next step yet - wait for bottom sheet interaction
      setShowCorrectOverlay(true);
      setPendingNextStep(nextStep);
      setAnswerMode('correct');
      setDrillRewards(nextStepData.points);
      return;
    }
    
    // Show Figma-like correct overlay for TA intro first question (legacy support)
    if (lessonId === 11 && stepId === 'intro' && nextStep === 'correct_def') {
      // Show overlay but DON'T advance to next step yet - wait for bottom sheet interaction
      setShowCorrectOverlay(true);
      setPendingNextStep(nextStep);
      setAnswerMode('correct');
      setDrillRewards(2); // Default reward for this specific case
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
        if (shouldComplete) {
          try {
            // Mark lesson as completed (tracks attempts + completed list)
            await markLessonCompleted(lessonId);
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
            buttonText={choices && choices.length === 1 && step.id !== 'simple_text_step' ? choices[0].text : undefined}
            onButtonPress={choices && choices.length === 1 && step.id !== 'simple_text_step' ? () => handleChoice(choices[0].nextStep) : undefined}
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
          
          {/* New candle patterns */}
          {step.visual === 'dragonflyCandle' && (
            <View style={styles.candleSvgWrapper}><DragonflyDoji width={60} height={120} /></View>
          )}
          {step.visual === 'dojiCandle' && (
            <View style={styles.candleSvgWrapper}><Doji width={60} height={120} /></View>
          )}
          {step.visual === 'bullishEngulfingCandle' && (
            <View style={styles.candleSvgWrapper}><BullishEngulfing width={120} height={120} /></View>
          )}
          {step.visual === 'bearishEngulfingCandle' && (
            <View style={styles.candleSvgWrapper}><BearishEngulfing width={120} height={120} /></View>
          )}
          {step.visual === 'bullishHaramiCandle' && (
            <View style={styles.candleSvgWrapper}><BullishEngulfing width={120} height={120} /></View>
          )}
          {step.visual === 'bearishHaramiCandle' && (
            <View style={styles.candleSvgWrapper}><BearishEngulfing width={120} height={120} /></View>
          )}
          {step.visual === 'threeInsideUpCandle' && (
            <View style={styles.candleSvgWrapper}><BullishEngulfing width={120} height={120} /></View>
          )}
          {step.visual === 'threeInsideDownCandle' && (
            <View style={styles.candleSvgWrapper}><BearishEngulfing width={120} height={120} /></View>
          )}
          {step.visual === 'shootingStarDayCandle' && (
            <View style={styles.candleSvgWrapper}><ShootingStar width={60} height={120} /></View>
          )}
          {step.visual === 'shootingStarEveningCandle' && (
            <View style={styles.candleSvgWrapper}><ShootingStar width={60} height={120} /></View>
          )}
          
          {/* New visual types for the redesigned lessons */}
          {step.visual === 'dragonflyTrend' && (
            <View style={styles.candleSvgWrapper}>
              <DragonflyDoji width={60} height={120} />
            </View>
          )}
          {step.visual === 'dragonflyReversal' && (
            <View style={styles.candleSvgWrapper}>
              <DragonflyDoji width={60} height={120} />
            </View>
          )}
          {step.visual === 'regularDoji' && (
            <View style={styles.candleSvgWrapper}><RegularDoji width={60} height={80} /></View>
          )}
          {step.visual === 'invertedHammerNew' && (
            <View style={styles.candleSvgWrapper}><InvertedHammerNew width={60} height={120} /></View>
          )}
          {step.visual === 'dojiUptrend' && (
            <View style={styles.candleSvgWrapper}>
              <DojiLessonVisuals type="uptrend" width={300} height={200} />
            </View>
          )}
          {step.visual === 'dojiReversal' && (
            <View style={styles.candleSvgWrapper}>
              <DojiLessonVisuals type="reversal" width={300} height={200} />
            </View>
          )}
          {step.visual === 'dojiIntro' && (
            <View style={styles.candleSvgWrapper}>
              <DojiLessonVisuals type="intro" width={300} height={200} />
            </View>
          )}
          {step.visual === 'dojiDefinition' && (
            <View style={styles.candleSvgWrapper}>
              <DojiLessonVisuals type="definition" width={300} height={200} />
            </View>
          )}
          {step.visual === 'dojiCharacteristics' && (
            <View style={styles.candleSvgWrapper}>
              <DojiLessonVisuals type="characteristics" width={300} height={200} />
            </View>
          )}
          {step.visual === 'dojiRule' && (
            <View style={styles.candleSvgWrapper}>
              <DojiLessonVisuals type="rule" width={300} height={200} />
            </View>
          )}
          {step.visual === 'dojiSummary' && (
            <View style={styles.candleSvgWrapper}>
              <DojiLessonVisuals type="summary" width={300} height={200} />
            </View>
          )}
          {/* MultiSelect drill */}
          {step.activity === 'multiSelect' && step.activityConfig?.options && (
            <MultiSelectDrill
              options={step.activityConfig.options.map(o => ({
                id: o.id,
                label: o.label,
                imageSource: o.imageKey ? characterImages[o.imageKey] : undefined,
                correct: o.correct,
              }))}
              layout={step.activityConfig.layout || 'grid'}
              submitText={step.activityConfig.submitText || 'בדוק'}
              onSubmit={async ({ numCorrectSelections }) => {
                const reward = numCorrectSelections; // 1 lightning per correct selection
                if (reward > 0) {
                  try {
                    await setLightnings(lightnings + reward);
                  } catch (e) {
                    console.error('Failed updating lightnings', e);
                  }
                }
                setDrillRewards(reward);
                setShowCorrectOverlay(true);
              }}
            />
          )}

          {/* Carousel select drill */}
          {step.activity === 'carouselSelect' && step.activityConfig?.carousel && (
            <CarouselSelectDrill
              items={step.activityConfig.carousel.items.map(i => ({
                id: i.id,
                imageSource: i.imageKey ? characterImages[i.imageKey] : undefined,
                label: i.label,
              }))}
              correctId={step.activityConfig.carousel.correctId}
              explanationOnWrong={step.activityConfig.carousel.explanationOnWrong}
              submitText={step.activityConfig.carousel.submitText || 'אישור'}
              onSubmit={async ({ correct }) => {
                const reward = correct ? 3 : 0;
                if (reward > 0) {
                  try { await setLightnings(lightnings + reward); } catch (e) { console.error(e); }
                }
                setDrillRewards(reward);
                setShowCorrectOverlay(true);
              }}
            />
          )}

          {/* Drag-match drill */}
          {step.activity === 'dragMatch' && step.activityConfig?.dragMatch && (
            <DragMatchDrill
              slots={step.activityConfig.dragMatch.slots.map(s => ({
                id: s.id,
                drawKey: s.drawKey as any,
                imageSource: s.imageKey ? characterImages[s.imageKey] : undefined,
                labelBelow: s.labelBelow,
              }))}
              tokens={step.activityConfig.dragMatch.tokens}
              submitText={step.activityConfig.dragMatch.submitText || 'אישור'}
              onSubmit={async ({ numCorrect, total }) => {
                const reward = numCorrect; // 1 per correct match
                if (reward > 0) {
                  try { await setLightnings(lightnings + reward); } catch (e) { console.error(e); }
                }
                setDrillRewards(reward);
                setShowCorrectOverlay(true);
              }}
            />
          )}

          {/* Sequence build drill */}
          {step.activity === 'sequenceBuild' && step.activityConfig?.sequenceBuild && (
            <SequenceBuildDrill
              slotsCount={step.activityConfig.sequenceBuild.slotsCount}
              options={step.activityConfig.sequenceBuild.options}
              correctSequence={step.activityConfig.sequenceBuild.correctSequence}
              submitText={step.activityConfig.sequenceBuild.submitText || 'אישור'}
              onSubmit={async ({ correct }) => {
                const reward = correct ? 4 : 0; // For patterns, default reward 4
                if (reward > 0) { try { await setLightnings(lightnings + reward); } catch (e) { console.error(e); } }
                setDrillRewards(reward);
                setShowCorrectOverlay(true);
              }}
            />
          )}
        </View>
        <View style={styles.choices}>
          {choices && choices.length > 1
            ? choices.map((choice, idx) => (
                <Pressable
                  key={choice.text}
                  onPress={() => setSelectedChoiceIdx(idx)}
                  style={({ pressed }) => [
                    styles.choiceCard,
                    pressed && { transform: [{ scale: 0.985 }] },
                    selectedChoiceIdx === idx && styles.choiceCardSelected,
                    answerMode === 'correct' && idx === selectedChoiceIdx && styles.choiceCardCorrect,
                  ]}
                >
                  <Text style={[
                    styles.choiceText,
                    selectedChoiceIdx === idx && styles.choiceTextSelected,
                    answerMode === 'correct' && idx === selectedChoiceIdx && styles.choiceTextCorrect,
                  ]}>{choice.text}</Text>
                </Pressable>
              ))
            : null}
          {choices && choices.length > 1 && selectedChoiceIdx !== null && (
            <Pressable
              style={styles.confirmButton}
              onPress={() => {
                const next = choices[selectedChoiceIdx!].nextStep;
                setSelectedChoiceIdx(null);
                handleChoice(next);
              }}
            >
              <Text style={styles.confirmButtonText}>אישור</Text>
            </Pressable>
          )}
          {step.id === 'simple_text_step' && choices && choices.length === 1 && (
            <Pressable
              style={styles.simpleTextButton}
              onPress={() => {
                handleChoice(choices[0].nextStep);
              }}
            >
              <Text style={styles.confirmButtonText}>אישור</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
      {showCorrectOverlay && (
        <View style={styles.correctOverlayContainer}>
          <View style={styles.correctSheet}>
            <Text style={styles.correctTitle}>
              {step.activity ? 'בדיקה הושלמה' : 'תשובה נכונה!'}
            </Text>
            <View style={styles.rewardPill}>
              <Text style={styles.rewardPillText}>{`⚡ X ${drillRewards} - זכית ב־`}</Text>
            </View>
            <Pressable
              style={styles.nextButton}
              onPress={() => {
                setShowCorrectOverlay(false);
                if (pendingNextStep) {
                  const next = pendingNextStep;
                  setPendingNextStep(null);
                  setStepId(next);
                } else {
                  setPendingNextStep(null);
                }
              }}
            >
              <Text style={styles.nextButtonText}>שאלה הבאה</Text>
            </Pressable>
          </View>
        </View>
      )}
      <View style={styles.progressContainer}>
        {/* <Text style={styles.progressText}>
          {`${currentLessonSteps.findIndex(s => s.id === stepId) + 1}/${currentLessonSteps.length}`}
        </Text> */}
        <View style={styles.progressBarBg}>
          <View style={{
            width: `${((currentLessonSteps.findIndex(s => s.id === stepId) + 1) / currentLessonSteps.length) * 100}%`,
            height: '100%',
            backgroundColor: '#62D24C',
            borderRadius: 8,
          }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 150,
    width: "100%",
    paddingHorizontal: 8,
    // backgroundColor: 'red'
  },
  bubbleWrapper: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    marginBottom: 0,
    paddingBottom: 90,
    // backgroundColor: 'blue'
  },
  choices: {
    width: "100%",
    alignItems: "center",
    maxWidth: 500,
    alignSelf: 'center',
    marginTop: 8,
    // backgroundColor: 'green'
  },
  choiceCard: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginVertical: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 10,
    // elevation: 3,
    alignItems: 'center',
  },
  choiceText: {
    color: '#0D2033',
    fontWeight: '700',
    fontSize: 18,
  },
  choiceCardSelected: {
    backgroundColor: '#3F9FFF',
  },
  choiceTextSelected: {
    color: '#FFFFFF',
  },
  choiceCardCorrect: {
    backgroundColor: '#62D24C',
  },
  choiceTextCorrect: {
    color: '#FFFFFF',
  },
  choiceButton: {
    maxWidth: '95%',
    width: 340,
    alignSelf: 'center',
  },
  confirmButton: {
    marginTop: 370,
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    position: 'absolute'
  },
  simpleTextButton: {
    marginTop: 20,
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: 'center'
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
    width: '100%',
    maxWidth: 500,
  },
  candleSvgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    padding: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e355e',
    marginBottom: 2,
    textAlign: 'center',
  },
  progressBarBg: {
    width: 320,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 26,
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
  correctOverlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1
  },
  correctSheet: {
    width: '100%',
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 14,
  },
  correctTitle: {
    color: '#62D24C',
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 16,
  },
  rewardPill: {
    backgroundColor: '#EEF7EE',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardPillText: {
    color: '#0D2033',
    fontWeight: '700',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#3F9FFF',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  prevBubbleContainer: {
    transform: [{ scale: 0.98 }],
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1, // Ensure it's behind other elements
  },
});
