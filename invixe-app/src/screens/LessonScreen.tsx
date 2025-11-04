import React, { useState, useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet, Text, Pressable, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { LessonStep } from "../modules/lessons/types";
import { useLessons } from "../context/LessonsContext";
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
import SVGMultiSelectDrill from '../components/lesson/SVGMultiSelectDrill';
import CarouselSelectDrill from '../components/lesson/CarouselSelectDrill';
import DragMatchDrill from '../components/lesson/DragMatchDrill';
import SequenceBuildDrill from '../components/lesson/SequenceBuildDrill';
import Dialog from '../components/lesson/Dialog';
import QuestionWithImage from '../components/lesson/QuestionWithImage';
import QuestionWithSVG from '../components/lesson/QuestionWithSVG';
import TextWithSVG from '../components/lesson/TextWithSVG';

const characterImg = require("../assets/character.png");
const backgroundImages = {
  defaultBackground: require("../assets/DefaultBlankBackground.png"),
  bg1: require("../assets/DefaultBlankBackground.png"),
  bg2: require("../assets/DefaultBlankBackground.png"),
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

const inMemorySteps: Record<number, LessonStep[]> = {};

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
  const { getLessonSteps } = useLessons();
  const [showCorrectOverlay, setShowCorrectOverlay] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<string | null>(null);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [answerMode, setAnswerMode] = useState<'none' | 'correct'>('none');
  const [drillRewards, setDrillRewards] = useState<number>(0);
  const [drillExplanation, setDrillExplanation] = useState<string | null>(null);
  const [showingDrillExplanation, setShowingDrillExplanation] = useState(false);
  const [showSimpleQuestionButtonSheet, setShowSimpleQuestionButtonSheet] = useState(false);
  const [simpleQuestionIsCorrect, setSimpleQuestionIsCorrect] = useState(false);
  const [svgMultiSelectCanSubmit, setSvgMultiSelectCanSubmit] = useState(false);
  const svgMultiSelectSubmitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (route.params?.lessonId) {
      setStepId("intro");
    }
  }, [route.params?.lessonId]);

  const [currentLessonSteps, setCurrentLessonSteps] = useState<LessonStep[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = inMemorySteps[lessonId];
      if (cached) {
        if (!cancelled) setCurrentLessonSteps(cached);
        return;
      }
      const steps = await getLessonSteps(lessonId);
      inMemorySteps[lessonId] = steps;
      if (!cancelled) setCurrentLessonSteps(steps);
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  // Reset drill state when step changes
  useEffect(() => {
    setSelectedChoiceIdx(null);
    setShowingDrillExplanation(false);
    setDrillExplanation(null);
    setDrillRewards(0);
    setShowCorrectOverlay(false);
    setPendingNextStep(null);
    setShowSimpleQuestionButtonSheet(false);
    setSimpleQuestionIsCorrect(false);
    setSvgMultiSelectCanSubmit(false);
    svgMultiSelectSubmitRef.current = null;
  }, [stepId]);

  const step: LessonStep =
    currentLessonSteps.find((s: LessonStep) => s.id === stepId) ||
    currentLessonSteps[0];

  const isDialog = step?.activity === 'dialog' && !!step.activityConfig?.dialog;
  const isExplain = step?.activity === 'textWithImageExplain' && !!step.activityConfig?.questionWithImage;
  const isTextWithSVG = step?.activity === 'textWithSVG' && !!step.activityConfig?.questionWithImage;
  const isSimpleQuestion = step?.activity === 'simple_question';
  const isSVGMultiSelect = step?.activity === 'svgMultiSelect' && !!step.activityConfig?.svgOptions;

  const handleDrillComplete = (result: { isCorrect: boolean; explanation: string; numCorrectSelections?: number; correct?: boolean; numCorrect?: number; total?: number; rewards?: number }) => {
    const rewards = result.rewards || result.numCorrectSelections || (result.correct ? 1 : 0) || (result.numCorrect || 0);
    const isCorrect = result.isCorrect || result.correct || false;
    
    // For simple_question, show button sheet instead of just setting explanation
    if (isSimpleQuestion) {
      setSimpleQuestionIsCorrect(isCorrect);
      setDrillRewards(rewards);
      setDrillExplanation(result.explanation);
      setShowSimpleQuestionButtonSheet(true);
      // Award lightnings
      if (rewards > 0) {
        setLightnings(lightnings + rewards);
      }
    } else {
      setDrillRewards(rewards);
      setDrillExplanation(result.explanation);
      setShowingDrillExplanation(true);
      // Award lightnings
      if (rewards > 0) {
        setLightnings(lightnings + rewards);
      }
    }
  };

  const handleExplanationContinue = () => {
    setShowingDrillExplanation(false);
    setDrillExplanation(null);
    // Navigate to next step based on choices[0].nextStep
    if (step.choices && step.choices[0]) {
      handleChoice(step.choices[0].nextStep);
    }
  };

  const handleSimpleQuestionButtonSheetContinue = () => {
    setShowSimpleQuestionButtonSheet(false);
    // Navigate to next step based on the selected choice's nextStep
    if (selectedChoiceIdx !== null && step.choices && step.choices[selectedChoiceIdx]) {
      const next = step.choices[selectedChoiceIdx].nextStep;
      setSelectedChoiceIdx(null);
      handleChoice(next);
    }
  };

  const handleChoice = (nextStep: string) => {
    // If the next step is a known fail step, navigate to fail immediately
    if (nextStep === 'wrong1') {
      navigation.navigate('LessonFail');
      return;
    }
    
    // Check if lesson is complete (empty/undefined nextStep or nextStep doesn't exist in steps)
    const isEmptyOrInvalid = !nextStep || nextStep === "" || !currentLessonSteps.find(s => s.id === nextStep);
    
    if (isEmptyOrInvalid || nextStep === "map") {
      // Lesson is complete - navigate to completion screen
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(async () => {
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
      });
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
    
    // Navigate to next step in lesson
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStepId(nextStep);
      fadeAnim.setValue(1);
    });
  };

  // Loading state animations
  const loadingAnimation = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Opacity pulse animation for character
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(loadingAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Spin animation for loader
    Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const opacity = loadingAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  if (!step) {
    return (
      <PageBackground source={backgroundImages.bg1}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingCharacterContainer, { opacity }]}>
            <Image
              source={characterImg}
              style={styles.loadingCharacter}
            />
          </Animated.View>
          <View style={styles.loadingSpinnerContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <ActivityIndicator size="large" color="#3F9FFF" />
            </Animated.View>
          </View>
          <Text style={styles.loadingText}>טוען שיעור...</Text>
        </View>
      </PageBackground>
    );
  }

  const choices = step.choices;

  return (
    <PageBackground source={backgroundImages[step.backgroundImage as keyof typeof backgroundImages] || backgroundImages.defaultBackground}>
      <TopBar />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>        
        {step.showInventory && step.inventory && (
          <Inventory inventory={step.inventory} />
        )}
        {/* Text with image explanation activity - outside bubbleWrapper for proper flex layout */}
        {step.activity === 'textWithImageExplain' && step.activityConfig?.questionWithImage && (
          <View style={styles.textWithImageWrapper}>
            <SpeechBubble 
              message={step.message || ''}
              position={step.bubblePosition || 'topRight'}
              align={step.bubblePosition?.includes('Right') ? 'flex-end' : step.bubblePosition?.includes('Left') ? 'flex-start' : 'center'}
              disableTyping
              disableEnterAnim
            />
            {(step.activityConfig.questionWithImage.uploadedImagePublicUrl || step.activityConfig.questionWithImage.uploadedImageUrl || step.activityConfig.questionWithImage.uploadedImage) && (
              <View style={styles.textWithImageContainer}>
                <Image
                  source={{ 
                    uri: step.activityConfig.questionWithImage.uploadedImagePublicUrl 
                      || step.activityConfig.questionWithImage.uploadedImageUrl
                      || step.activityConfig.questionWithImage.uploadedImage 
                  }}
                  style={styles.textWithImageImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        )}
        
        <View style={styles.bubbleWrapper}>
          {/* Dialog activity */}
          {step.activity === 'dialog' && step.activityConfig?.dialog && (
            <Dialog
              messages={step.activityConfig.dialog.messages}
              typingSpeed={step.activityConfig.dialog.typingSpeed ?? 40}
              autoAdvance={step.activityConfig.dialog.autoAdvance ?? true}
              autoAdvanceDelay={step.activityConfig.dialog.autoAdvanceDelay ?? 2000}
              onComplete={() => {
                if (choices && choices.length === 1) {
                  handleChoice(choices[0].nextStep);
                }
              }}
            />
          )}

          {/* Text with SVG explanation activity */}
          {step.activity === 'textWithSVG' && step.activityConfig?.questionWithImage && (
            <TextWithSVG
              text={step.message}
              svgCode={step.activityConfig.questionWithImage.svgCode}
              submitText={step.activityConfig.questionWithImage.submitText || 'המשך'}
              onContinue={() => {
                if (choices && choices.length >= 1) {
                  handleChoice(choices[0].nextStep);
                }
              }}
            />
          )}

          {/* Question with image drill */}
          {step.activity === 'questionWithImage' && step.activityConfig?.questionWithImage && (
            <QuestionWithImage
              question={step.activityConfig.questionWithImage.question || ''}
              imageSource={step.activityConfig.questionWithImage.uploadedImage 
                ? { uri: step.activityConfig.questionWithImage.uploadedImage }
                : require('../assets/DefaultBlankBackground.png')}
              choices={step.activityConfig.questionWithImage.choices || []}
              submitText={step.activityConfig.questionWithImage.submitText || 'בדוק'}
              correctExplanation={step.activityConfig.questionWithImage.correctExplanation}
              wrongExplanation={step.activityConfig.questionWithImage.wrongExplanation}
              onSubmit={(result) => {
                const rewards = result.isCorrect ? (step.activityConfig?.questionWithImage?.rewards || 0) : 0;
                handleDrillComplete({
                  ...result,
                  rewards
                });
              }}
            />
          )}

          {/* Question with SVG drill */}
          {step.activity === 'questionWithSVG' && step.activityConfig?.questionWithImage && (
            <QuestionWithSVG
              question={step.activityConfig.questionWithImage.question || ''}
              svgCode={step.activityConfig.questionWithImage.svgCode || ''}
              choices={step.activityConfig.questionWithImage.choices || []}
              submitText={step.activityConfig.questionWithImage.submitText || 'בדוק'}
              correctExplanation={step.activityConfig.questionWithImage.correctExplanation}
              wrongExplanation={step.activityConfig.questionWithImage.wrongExplanation}
              onSubmit={(result) => {
                const rewards = result.isCorrect ? (step.activityConfig?.questionWithImage?.rewards || 0) : 0;
                handleDrillComplete({
                  ...result,
                  rewards
                });
              }}
            />
          )}

          {/* Hide bubble when dialog, explain, textWithSVG, simpleQuestion, or svgMultiSelect is active */}
          {!(isDialog || isExplain || isTextWithSVG || isSimpleQuestion || isSVGMultiSelect) && (
            <SpeechBubble 
              message={showingDrillExplanation ? (drillExplanation || step.message) : step.message} 
              characterImg={getCharacterImg(step.characterImg)} 
              position={step.bubblePosition || 'bottomLeft'}
              align={step.bubblePosition?.includes('Right') ? 'flex-end' : step.bubblePosition?.includes('Left') ? 'flex-start' : 'center'}
              buttonText={showingDrillExplanation ? 'המשך' : (choices && choices.length === 1 && step.id !== 'simple_text_step' ? choices[0].text : undefined)}
              onButtonPress={showingDrillExplanation ? handleExplanationContinue : (choices && choices.length === 1 && step.id !== 'simple_text_step' ? () => handleChoice(choices[0].nextStep) : undefined)}
            />
          )}

          {/* Simple question - show speech bubble with message/explanation */}
          {isSimpleQuestion && (
            <SpeechBubble 
              message={showingDrillExplanation ? (drillExplanation || step.message) : step.message} 
              characterImg={getCharacterImg(step.characterImg)} 
              position={step.bubblePosition || 'bottomLeft'}
              align={step.bubblePosition?.includes('Right') ? 'flex-end' : step.bubblePosition?.includes('Left') ? 'flex-start' : 'center'}
              disableTyping
              disableEnterAnim
            />
          )}
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
              correctExplanation={step.activityConfig.correctExplanation}
              wrongExplanation={step.activityConfig.wrongExplanation}
              onSubmit={handleDrillComplete}
            />
          )}

          {/* SVG MultiSelect drill */}
          {step.activity === 'svgMultiSelect' && step.activityConfig?.svgOptions && (
            <>
              <SpeechBubble 
                message={showingDrillExplanation ? (drillExplanation || step.message) : step.message} 
                characterImg={getCharacterImg(step.characterImg)} 
                position={step.bubblePosition || 'bottomLeft'}
                align={step.bubblePosition?.includes('Right') ? 'flex-end' : step.bubblePosition?.includes('Left') ? 'flex-start' : 'center'}
                disableTyping
                disableEnterAnim
              />
              <View style={{ width: '100%', paddingHorizontal: 16, marginTop: 10 }}>
                <SVGMultiSelectDrill
                  options={step.activityConfig.svgOptions.map((o: any) => ({
                    id: o.id,
                    label: o.label,
                    svgCode: o.svgCode || undefined,
                    svgUrl: o.svgUrl || undefined,
                    svgPublicUrl: o.svgPublicUrl || undefined,
                    svgPath: o.svgPath || undefined,
                    correct: o.correct,
                  }))}
                  layout={step.activityConfig.layout || 'grid'}
                  submitText={step.activityConfig.submitText || 'בדוק'}
                  correctExplanation={step.activityConfig.correctExplanation}
                  wrongExplanation={step.activityConfig.wrongExplanation}
                  onSubmit={(result) => {
                    // Extract rewards from activityConfig, similar to simple_question
                    const rewards = result.isCorrect ? (step.activityConfig?.rewards || 0) : 0;
                    handleDrillComplete({
                      ...result,
                      rewards
                    });
                  }}
                  showSubmitButton={false}
                  onSubmitTriggerRef={svgMultiSelectSubmitRef}
                  onStateChange={(state) => {
                    // Track if we can submit - button should only show when selections are made
                    setSvgMultiSelectCanSubmit(state.canSubmit);
                  }}
                />
              </View>
            </>
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
              submitText={step.activityConfig.carousel.submitText || 'אישור'}
              correctExplanation={step.activityConfig.carousel.correctExplanation}
              wrongExplanation={step.activityConfig.carousel.wrongExplanation}
              onSubmit={handleDrillComplete}
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
              correctExplanation={step.activityConfig.dragMatch.correctExplanation}
              wrongExplanation={step.activityConfig.dragMatch.wrongExplanation}
              onSubmit={handleDrillComplete}
            />
          )}

          {/* Sequence build drill */}
          {step.activity === 'sequenceBuild' && step.activityConfig?.sequenceBuild && (
            <SequenceBuildDrill
              slotsCount={step.activityConfig.sequenceBuild.slotsCount}
              options={step.activityConfig.sequenceBuild.options}
              correctSequence={step.activityConfig.sequenceBuild.correctSequence}
              submitText={step.activityConfig.sequenceBuild.submitText || 'אישור'}
              correctExplanation={step.activityConfig.sequenceBuild.correctExplanation}
              wrongExplanation={step.activityConfig.sequenceBuild.wrongExplanation}
              onSubmit={handleDrillComplete}
            />
          )}
        </View>
        {/* Choices: hidden during dialog/explain/textWithSVG to reduce clutter */}
        {!(isDialog || isExplain || isTextWithSVG) && (
          <View style={styles.choices}>
            {isSimpleQuestion && choices && choices.length > 0 && (
              <>
                {choices.map((choice, idx) => {
                  const isSelected = selectedChoiceIdx === idx;
                  const isCorrect = (choice as any).correct === true;
                  const isSubmitted = showSimpleQuestionButtonSheet || showingDrillExplanation;
                  
                  let cardStyle: any[] = [styles.choiceCard];
                  let textStyle: any[] = [styles.choiceText];
                  
                  if (isSubmitted) {
                    if (isSelected && isCorrect) {
                      cardStyle.push(styles.choiceCardCorrect);
                      textStyle.push(styles.choiceTextCorrect);
                    } else if (isSelected && !isCorrect) {
                      cardStyle.push(styles.choiceCardWrong);
                      textStyle.push(styles.choiceTextWrong);
                    } else if (!isSelected && isCorrect) {
                      cardStyle.push(styles.choiceCardCorrect);
                      textStyle.push(styles.choiceTextCorrect);
                    } else {
                      cardStyle.push(styles.choiceCardDisabled);
                      textStyle.push(styles.choiceTextDisabled);
                    }
                  } else if (isSelected) {
                    cardStyle.push(styles.choiceCardSelected);
                    textStyle.push(styles.choiceTextSelected);
                  }

                  return (
                    <Pressable
                      key={choice.text}
                      onPress={() => {
                        if (!isSubmitted) {
                          setSelectedChoiceIdx(idx);
                        }
                      }}
                      style={({ pressed }) => [
                        ...cardStyle,
                        pressed && !isSubmitted && { transform: [{ scale: 0.985 }] },
                      ]}
                    >
                      <Text style={textStyle}>{choice.text}</Text>
                    </Pressable>
                  );
                })}
                {!showSimpleQuestionButtonSheet && selectedChoiceIdx !== null && (
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => {
                      if (!showSimpleQuestionButtonSheet && !showingDrillExplanation) {
                        // Submit logic
                        if (selectedChoiceIdx !== null) {
                          const selectedChoice = choices[selectedChoiceIdx] as any;
                          const correct = selectedChoice?.correct === true;
                          const explanation = correct 
                            ? (step.activityConfig?.correctExplanation || 'נכון!')
                            : (step.activityConfig?.wrongExplanation || 'לא נכון, נסה שוב');
                          
                          const rewards = correct ? (step.activityConfig?.rewards || 0) : 0;
                          handleDrillComplete({
                            isCorrect: correct,
                            explanation,
                            correct,
                            numCorrect: correct ? 1 : 0,
                            total: 1,
                            rewards
                          });
                        }
                      } else {
                        // Continue logic (shouldn't happen for simple_question with button sheet)
                        if (selectedChoiceIdx !== null && choices[selectedChoiceIdx]) {
                          const next = choices[selectedChoiceIdx].nextStep;
                          setSelectedChoiceIdx(null);
                          handleChoice(next);
                        }
                      }
                    }}
                  >
                    <Text style={styles.primaryButtonText}>בדוק</Text>
                  </Pressable>
                )}
              </>
            )}
            {!isSimpleQuestion && choices && choices.length > 1 && (
              <>
                {choices.map((choice, idx) => (
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
                ))}
                {selectedChoiceIdx !== null && (
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => {
                      const next = choices[selectedChoiceIdx!].nextStep;
                      setSelectedChoiceIdx(null);
                      handleChoice(next);
                    }}
                  >
                    <Text style={styles.primaryButtonText}>אישור</Text>
                  </Pressable>
                )}
              </>
            )}
            {!isSimpleQuestion && !isSVGMultiSelect && choices && choices.length === 1 && step.id !== 'simple_text_step' && (
              <Pressable
                style={styles.primaryButton}
                onPress={() => handleChoice(choices[0].nextStep)}
              >
                <Text style={styles.primaryButtonText}>{choices[0].text || 'המשך'}</Text>
              </Pressable>
            )}
          </View>
        )}
      </Animated.View>
      {/* Legacy overlay - only show for non-drill steps if needed */}
      {showCorrectOverlay && !showingDrillExplanation && (
        <View style={styles.correctOverlayContainer}>
          <View style={styles.correctSheet}>
            <Text style={styles.correctTitle}>
              {drillRewards > 0 ? 'תשובה נכונה!' : 'תשובה שגויה'}
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
      {/* Button sheet for simple_question */}
      {showSimpleQuestionButtonSheet && isSimpleQuestion && (
        <View style={styles.buttonSheetContainer}>
          <View style={styles.buttonSheet}>
            <Text style={[styles.buttonSheetTitle, simpleQuestionIsCorrect ? styles.buttonSheetTitleCorrect : styles.buttonSheetTitleWrong]}>
              {simpleQuestionIsCorrect ? 'תשובה נכונה!' : 'טעות'}
            </Text>
            {simpleQuestionIsCorrect && drillRewards > 0 && (
              <View style={styles.buttonSheetRewardRow}>
                <Text style={styles.buttonSheetRewardText}>הרווחת {drillRewards}$</Text>
              </View>
            )}
            <Pressable
              style={[styles.buttonSheetContinueButton, !simpleQuestionIsCorrect && styles.buttonSheetContinueButtonWrong]}
              onPress={handleSimpleQuestionButtonSheetContinue}
            >
              <Text style={styles.buttonSheetContinueButtonText}>המשך</Text>
            </Pressable>
          </View>
        </View>
      )}
      {/* Absolute continue button for textWithImageExplain */}
      {step.activity === 'textWithImageExplain' && step.activityConfig?.questionWithImage && !showCorrectOverlay && (
        <View style={styles.absoluteContinueButton}>
          <Pressable
            style={styles.continueButton}
            onPress={() => {
              if (choices && choices.length >= 1) {
                handleChoice(choices[0].nextStep);
              }
            }}
          >
            <Text style={styles.continueButtonText}>
              {step.activityConfig.questionWithImage.submitText || 'המשך'}
            </Text>
          </Pressable>
        </View>
      )}
      {/* Static button for svgMultiSelect - using choices pattern like other drills */}
      {step.activity === 'svgMultiSelect' && step.activityConfig?.svgOptions && !showSimpleQuestionButtonSheet && !showCorrectOverlay && choices && choices.length === 1 && (svgMultiSelectCanSubmit || showingDrillExplanation) && (
        <View style={styles.absoluteContinueButton}>
          <Pressable
            style={styles.continueButton}
            onPress={() => {
              if (showingDrillExplanation) {
                // Continue to next step
                handleExplanationContinue();
              } else if (svgMultiSelectSubmitRef.current && svgMultiSelectCanSubmit) {
                // Trigger submit from drill component
                svgMultiSelectSubmitRef.current();
              }
            }}
            disabled={!showingDrillExplanation && !svgMultiSelectCanSubmit}
          >
            <Text style={styles.continueButtonText}>
              {showingDrillExplanation ? 'המשך' : (step.activityConfig.submitText || 'בדוק')}
            </Text>
          </Pressable>
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
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 16,
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
  textWithImageWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
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
    textAlign: 'center',
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
  choiceCardWrong: {
    backgroundColor: '#FF6B6B',
  },
  choiceTextWrong: {
    color: '#FFFFFF',
  },
  choiceCardDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  choiceTextDisabled: {
    color: '#9CA3AF',
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
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: 'center'
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  explainContainer: {
    width: '92%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  explainText: {
    color: '#0D2033',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  explainImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#0D2033',
    marginBottom: 16,
  },
  textWithImageContainer: {
    width: '94%',
    maxWidth: 480,
    alignSelf: 'center',
    flex: 1,
    minHeight: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 14,
    overflow: 'hidden',
    maxHeight: '100%',
  },
  textWithImageImage: {
    width: '100%',
    height: '100%',
  },
  absoluteContinueButton: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  continueButton: {
    backgroundColor: '#3F9FFF',
    minWidth: 200,
    borderRadius: 16.4,
    paddingVertical: 16,
    paddingHorizontal: 21,
    marginBottom: 20,
    shadowColor: '#3F9FFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingCharacterContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCharacter: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  loadingSpinnerContainer: {
    marginBottom: 20,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3F9FFF',
    marginTop: 10,
  },
  buttonSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  buttonSheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  buttonSheetTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonSheetTitleCorrect: {
    color: '#62D24C',
  },
  buttonSheetTitleWrong: {
    color: '#FF6B6B',
  },
  buttonSheetRewardRow: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  buttonSheetRewardText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#62D24C',
  },
  buttonSheetContinueButton: {
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  buttonSheetContinueButtonWrong: {
    backgroundColor: '#FF6B6B',
  },
  buttonSheetContinueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
