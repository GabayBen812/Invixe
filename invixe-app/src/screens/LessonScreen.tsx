import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Image,
  Animated,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  Easing,
} from "react-native";
import { SvgUri } from "react-native-svg";
import { parseSVGCode } from "../utils/svgParser";
import { fetchRemoteText } from "../utils/remoteAssetCache";
import { preloadLessonAssetsCached } from "../utils/lessonAssetPreload";
import {
  getAlternateSupabaseUrl,
  normalizeSupabaseUrl,
} from "../utils/supabaseUrl";
import { countGradedFromDrillResult } from "../utils/lessonResults";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { LessonStep, Choice } from "../modules/lessons/types";
import { useDictionary } from "../context/DictionaryContext";
import { getDictionaryLinkForChoice } from "../data/dictionary";
import { findLessonInRegistry } from "../modules/lessons/lessonNavigation";
import {
  getThemeForLesson,
  isPracticeLesson,
  type LessonVisualTheme,
} from "../modules/lessons/lessonTheme";
import { useLessons } from "../context/LessonsContext";
import { LessonThemeProvider } from "../context/LessonThemeContext";
import Button from "../components/ui/Button";
import Inventory from "../components/lesson/Inventory";
import SpeechBubble from "../components/lesson/SpeechBubble";
import PageBackground from "../components/ui/PageBackground";
import { useUser } from "../context/UserContext";
import TopBar from "../components/ui/TopBar";
import DrillViewport from "../components/lesson/DrillViewport";
import {
  useChoiceDrillLayout,
  useUniformChoiceRowHeight,
} from "../hooks/useChoiceDrillLayout";
import {
  HammerCandleSVG,
  BullishCandleSVG,
  BearishCandleSVG,
  DojiCandleSVG,
} from "../components/lesson/CandlestickSVGs";
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
  InvertedHammerNew,
} from "../assets/Candels";
import DojiLessonVisuals from "../components/lesson/DojiLessonVisuals";
import MultiSelectDrill from "../components/lesson/MultiSelectDrill";
import SVGMultiSelectDrill from "../components/lesson/SVGMultiSelectDrill";
import CarouselSelectDrill from "../components/lesson/CarouselSelectDrill";
import DragMatchDrill from "../components/lesson/DragMatchDrill";
import SequenceBuildDrill from "../components/lesson/SequenceBuildDrill";
import Dialog from "../components/lesson/Dialog";
import QuestionWithImage from "../components/lesson/QuestionWithImage";
import QuestionWithSVG from "../components/lesson/QuestionWithSVG";
import TextWithSVG from "../components/lesson/TextWithSVG";
import GraphQuestionDrill from "../components/lesson/GraphQuestionDrill";
import DrillChoiceLabel from "../components/lesson/DrillChoiceLabel";
import { getDrillChoicePlainText, normalizeDrillChoices } from "../utils/drillFitLayout";
import PathSelectDrill from "../components/lesson/PathSelectDrill";
import PathSelectExplanation from "../components/lesson/PathSelectExplanation";
import TextWithImageExplainDrill from "../components/lesson/TextWithImageExplainDrill";
import ExplanationDrill from "../components/lesson/ExplanationDrill";
import HtmlText from "../components/ui/HtmlText";
import { sanitizeDisplayText } from "../utils/decodeHtmlEntities";

const characterImg = require("../assets/Characters/character_orange_noback.png");

// Helper component to handle image loading with error fallback
const ImageWithFallback = ({
  uri,
  style,
  stepId,
}: {
  uri: string;
  style: any;
  stepId: string;
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [activeUri, setActiveUri] = useState(() => normalizeSupabaseUrl(uri) || uri);
  const triedAlternateRef = React.useRef(false);

  React.useEffect(() => {
    triedAlternateRef.current = false;
    setActiveUri(normalizeSupabaseUrl(uri) || uri);
    setHasError(false);
    setIsLoading(true);
    setShowSpinner(false);
    const spinnerTimer = setTimeout(() => setShowSpinner(true), 150);
    return () => clearTimeout(spinnerTimer);
  }, [uri]);

  return (
    <>
      {hasError ? (
        <View
          style={[
            style,
            {
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: 8,
            },
          ]}
        >
          <Text
            style={{
              color: "#999",
              textAlign: "center",
              padding: 20,
              fontSize: 14,
            }}
          >
            Image not available
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: activeUri }}
          style={style}
          resizeMode="contain"
          onError={(error) => {
            const alternate = getAlternateSupabaseUrl(activeUri);
            if (alternate && !triedAlternateRef.current) {
              triedAlternateRef.current = true;
              setIsLoading(true);
              setShowSpinner(false);
              setActiveUri(alternate);
              return;
            }
            console.error(
              "Failed to load image for textWithImageExplain step",
              stepId,
              ":",
              error.nativeEvent?.error || error,
            );
            setHasError(true);
            setIsLoading(false);
          }}
          onLoad={() => {
            setIsLoading(false);
          }}
        />
      )}
      {isLoading && showSpinner && !hasError && (
        <View
          style={[
            style,
            {
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: 8,
            },
          ]}
        >
          <ActivityIndicator size="small" color="#3372D8" />
        </View>
      )}
    </>
  );
};
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

// Cache lesson steps in memory keyed by `${unitId}:${lessonId}` or `${lessonId}`
const inMemorySteps: Record<string, LessonStep[]> = {};

// Character image resolver
function getCharacterImg(characterImgKey?: string) {
  if (characterImgKey && characterImages[characterImgKey]) {
    return characterImages[characterImgKey];
  }
  return characterImages["character_orange_noback.png"];
}

type SimpleChoice = { text: string; correct?: boolean };

function LessonScreenBackground({
  isPractice,
  screenBg,
  backgroundSource,
  children,
}: {
  isPractice: boolean;
  screenBg: string;
  backgroundSource: number;
  children: React.ReactNode;
}) {
  if (isPractice) {
    return (
      <View style={[styles.practiceScreenBg, { backgroundColor: screenBg }]}>
        {children}
      </View>
    );
  }
  return <PageBackground source={backgroundSource}>{children}</PageBackground>;
}

function SimpleQuestionChoiceList({
  choices,
  selectedChoiceIdx,
  isSubmitted,
  onSelect,
  theme,
}: {
  choices: SimpleChoice[];
  selectedChoiceIdx: number | null;
  isSubmitted: boolean;
  onSelect: (idx: number) => void;
  theme: LessonVisualTheme;
}) {
  const layout = useChoiceDrillLayout(choices.length, { hasMedia: false });
  const isPractice = theme.variant === "practice";
  const isGrid = isPractice && choices.length > 2;
  const uniformRowHeight = useUniformChoiceRowHeight(
    choices as unknown as Record<string, unknown>[],
    layout,
    isGrid ? 200 : 420,
  );

  return (
    <View
      style={[
        styles.choices,
        styles.choicesSimpleQuestion,
        { gap: layout.choiceGap, paddingHorizontal: 8 },
        isPractice && styles.choicesSimpleQuestionPractice,
      ]}
    >
      {choices.map((choice, idx) => {
        const isSelected = selectedChoiceIdx === idx;
        const isCorrect = choice.correct === true;
        let cardStyle: object[] = [
          styles.choiceCard,
          isPractice && {
            backgroundColor: theme.choiceBg,
            borderWidth: 1,
            borderColor: theme.choiceBorder,
          },
        ];
        let textStyle: object[] = [
          styles.choiceText,
          isPractice && { color: theme.choiceText },
          {
            fontSize: layout.choiceFontSize,
            lineHeight: layout.choiceLineHeight,
          },
        ];

        if (isSubmitted) {
          if (isSelected && isCorrect) {
            cardStyle.push({ backgroundColor: theme.choiceCorrectBg });
            textStyle.push(styles.choiceTextCorrect);
          } else if (isSelected && !isCorrect) {
            cardStyle.push({ backgroundColor: theme.choiceWrongBg });
            textStyle.push(styles.choiceTextCorrect);
          } else if (!isSelected && isCorrect) {
            cardStyle.push({ backgroundColor: theme.choiceCorrectBg });
            textStyle.push(styles.choiceTextCorrect);
          } else {
            cardStyle.push({
              backgroundColor: theme.choiceDisabledBg,
              opacity: 0.6,
            });
            textStyle.push({ color: theme.choiceDisabledText });
          }
        } else if (isSelected) {
          cardStyle.push({ backgroundColor: theme.choiceSelectedBg });
          textStyle.push({ color: theme.choiceSelectedText });
        }

        return (
          <Pressable
            key={choice.text}
            onPress={() => {
              if (!isSubmitted) onSelect(idx);
            }}
            style={({ pressed }) => [
              ...cardStyle,
              {
                paddingVertical: layout.choicePaddingVertical,
                paddingHorizontal: layout.choicePaddingHorizontal,
                marginVertical: 0,
                minHeight: uniformRowHeight,
                height: uniformRowHeight,
                justifyContent: "center",
                ...(isGrid ? { width: "46%" as const } : {}),
              },
              pressed && !isSubmitted && { transform: [{ scale: 0.985 }] },
            ]}
          >
            <DrillChoiceLabel
              choice={choice}
              color={
                isSubmitted && isSelected && isCorrect
                  ? "#FFFFFF"
                  : isSubmitted && isSelected && !isCorrect
                    ? "#FFFFFF"
                    : isSelected
                      ? theme.choiceSelectedText
                      : theme.choiceText
              }
              style={textStyle}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function LessonScreen({ navigation, route }: Props) {
  const [stepId, setStepId] = useState("intro");
  const [fadeAnim] = useState(new Animated.Value(1));
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [progressAnim] = useState(new Animated.Value(0));
  const stepTransitionLockRef = useRef(false);
  const lessonId = route.params?.lessonId || 1;
  const {
    completedLessons,
    markLessonCompleted,
    setCompletedLessons,
    lightnings,
    setLightnings,
  } = useUser();
  const { openDictionary } = useDictionary();
  const { getLessonSteps, lessonsRegistry } = useLessons();
  const lessonMeta = findLessonInRegistry(lessonsRegistry, lessonId)?.lesson;
  const visualTheme = getThemeForLesson(lessonMeta);
  const isPractice = isPracticeLesson(lessonMeta?.lessonType, lessonMeta?.title);
  const [showCorrectOverlay, setShowCorrectOverlay] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<string | null>(null);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(
    null,
  );
  const [answerMode, setAnswerMode] = useState<"none" | "correct">("none");
  const [drillRewards, setDrillRewards] = useState<number>(0);
  const [drillExplanation, setDrillExplanation] = useState<string | null>(null);
  const [showingDrillExplanation, setShowingDrillExplanation] = useState(false);
  const [showSimpleQuestionButtonSheet, setShowSimpleQuestionButtonSheet] =
    useState(false);
  const [simpleQuestionIsCorrect, setSimpleQuestionIsCorrect] = useState(false);
  const [svgMultiSelectCanSubmit, setSvgMultiSelectCanSubmit] = useState(false);
  const svgMultiSelectSubmitRef = useRef<(() => void) | null>(null);
  const [questionSvgCanSubmit, setQuestionSvgCanSubmit] = useState(false);
  const questionSvgSubmitRef = useRef<(() => void) | null>(null);
  const [questionWithImageCanSubmit, setQuestionWithImageCanSubmit] =
    useState(false);
  const questionWithImageSubmitRef = useRef<(() => void) | null>(null);
  const [graphQuestionCanSubmit, setGraphQuestionCanSubmit] = useState(false);
  const graphQuestionSubmitRef = useRef<(() => void) | null>(null);
  const carouselSubmitRef = useRef<(() => void) | null>(null);
  const carouselRetryRef = useRef<(() => void) | null>(null);
  const [carouselFeedback, setCarouselFeedback] = useState({
    showing: false,
    isCorrect: false,
  });
  const [dragMatchCanSubmit, setDragMatchCanSubmit] = useState(false);
  const dragMatchSubmitRef = useRef<(() => void) | null>(null);
  const [sequenceBuildCanSubmit, setSequenceBuildCanSubmit] = useState(false);
  const sequenceBuildSubmitRef = useRef<(() => void) | null>(null);
  const [speechBubbleHeight, setSpeechBubbleHeight] = useState<number>(0);
  const speechBubbleContainerRef = useRef<View | null>(null);
  const [pathSelectViewingOption, setPathSelectViewingOption] = useState<
    string | null
  >(null);
  const [pathSelectViewingScreenIndex, setPathSelectViewingScreenIndex] =
    useState<number>(0);
  const [pathSelectCompletedOptions, setPathSelectCompletedOptions] = useState<
    Set<string>
  >(new Set());
  const [graphQuestionViewingExplanation, setGraphQuestionViewingExplanation] =
    useState<boolean>(false);
  const [graphQuestionSelectedChoiceId, setGraphQuestionSelectedChoiceId] =
    useState<string | null>(null);
  const [
    graphQuestionPNGViewingExplanation,
    setGraphQuestionPNGViewingExplanation,
  ] = useState<boolean>(false);
  const [
    graphQuestionPNGSelectedChoiceId,
    setGraphQuestionPNGSelectedChoiceId,
  ] = useState<string | null>(null);
  const [pendingGraphQuestionPNGResult, setPendingGraphQuestionPNGResult] =
    useState<{
      correct: boolean;
      selectedChoiceId: string;
      isCorrect: boolean;
      explanation: string;
    } | null>(null);
  const visitedStepsRef = useRef<Set<string>>(new Set());

  const runStepTransition = useCallback(
    (applyStepChange: () => void) => {
      if (stepTransitionLockRef.current) return;
      stepTransitionLockRef.current = true;

      const outMs = 200;
      const inMs = 280;

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: outMs,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: outMs,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          stepTransitionLockRef.current = false;
          return;
        }
        applyStepChange();
        slideAnim.setValue(-14);
        fadeAnim.setValue(0);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: inMs,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: inMs,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          stepTransitionLockRef.current = false;
        });
      });
    },
    [fadeAnim, slideAnim],
  );

  useEffect(() => {
    if (route.params?.lessonId) {
      setStepId("intro");
      visitedStepsRef.current.clear();
      visitedStepsRef.current.add("intro");
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      progressAnim.setValue(0);
      lessonStartedAtRef.current = Date.now();
      setSessionCoins(0);
      sessionCoinsRef.current = 0;
      sessionLightningsRef.current = 0;
      sessionGradedRef.current = { correctCount: 0, totalGraded: 0 };
    }
  }, [route.params?.lessonId]);

  const [currentLessonSteps, setCurrentLessonSteps] = useState<LessonStep[]>(
    [],
  );
  const [lessonContentReady, setLessonContentReady] = useState(false);
  const [preloadStatusText, setPreloadStatusText] = useState("טוען שיעור...");

  const unitId = route.params?.unitId;

  useEffect(() => {
    let cancelled = false;
    setLessonContentReady(false);
    setPreloadStatusText("טוען שיעור...");
    setCurrentLessonSteps([]);

    (async () => {
      const cacheKey = unitId ? `${unitId}:${lessonId}` : `${lessonId}`;
      let steps = inMemorySteps[cacheKey];
      if (!steps) {
        steps = await getLessonSteps(lessonId, unitId);
        inMemorySteps[cacheKey] = steps;
      }
      if (cancelled) return;

      setCurrentLessonSteps(steps);
      setPreloadStatusText("מכין את השיעור...");
      const result = await preloadLessonAssetsCached(cacheKey, steps);
      if (cancelled) return;

      if (result.timedOut && result.total > 0) {
        console.warn(
          `Lesson asset preload timed out (${result.loaded}/${result.total} loaded)`,
        );
      }
      setLessonContentReady(true);
    })().catch((err) => {
      console.error("Failed to prepare lesson:", err);
      if (!cancelled) setLessonContentReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [lessonId, unitId, getLessonSteps]);

  // Track current step as visited and update progress
  useEffect(() => {
    if (stepId && currentLessonSteps.length > 0) {
      visitedStepsRef.current.add(stepId);
      console.log(
        `Visited step: "${stepId}". Total visited: ${Array.from(visitedStepsRef.current).join(", ")}`,
      );

      // Calculate and animate progress
      const currentIndex = currentLessonSteps.findIndex(
        (s) => s && s.id === stepId,
      );
      const progress =
        currentIndex >= 0 ? (currentIndex + 1) / currentLessonSteps.length : 0;

      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // width animation doesn't support native driver
      }).start();

      // Reset graphQuestion state when step changes
      setGraphQuestionViewingExplanation(false);
      setGraphQuestionSelectedChoiceId(null);
      setGraphQuestionPNGViewingExplanation(false);
      setGraphQuestionPNGSelectedChoiceId(null);
    }
  }, [stepId, currentLessonSteps]);

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
    setQuestionSvgCanSubmit(false);
    setQuestionWithImageCanSubmit(false);
    setGraphQuestionCanSubmit(false);
    setPathSelectViewingOption(null);
    setPathSelectCompletedOptions(new Set());
    svgMultiSelectSubmitRef.current = null;
    questionSvgSubmitRef.current = null;
    questionWithImageSubmitRef.current = null;
    graphQuestionSubmitRef.current = null;
    carouselSubmitRef.current = null;
    carouselRetryRef.current = null;
    setCarouselFeedback({ showing: false, isCorrect: false });
  }, [stepId]);

  const step: LessonStep =
    currentLessonSteps.find((s: LessonStep) => s && s.id === stepId) ||
    currentLessonSteps[0] ||
    ({
      id: "intro",
      activity: "text",
      message: "",
      choices: [],
      backgroundImage: "bg1",
      activityConfig: {},
    } as unknown as LessonStep);

  // Log current step details for debugging
  console.log(`📍 Current step: "${step.id}", activity: "${step.activity}"`);
  console.log("step.choices:", step.choices);
  console.log(
    "step.activityConfig?.questionWithImage:",
    step.activityConfig?.questionWithImage ? "exists" : "missing",
  );

  const isDialog = step?.activity === "dialog" && !!step.activityConfig?.dialog;
  const isExplain =
    step?.activity === "textWithImageExplain" &&
    !!step.activityConfig?.questionWithImage;
  const activityType = step?.activity as any;
  const isExplanation =
    activityType === "explanation" &&
    !!step.activityConfig?.explanation;
  const isTextWithSVG =
    activityType === "textWithSVG" && !!step.activityConfig?.questionWithImage;
  const isSimpleQuestion = activityType === "simple_question";
  const isGraphQuestionActivity =
    activityType === "graphQuestion" || activityType === "graphQuestionPNG";
  const isQuestionWithSVGActivity =
    activityType === "questionWithSVG" || isGraphQuestionActivity;
  const isPathSelect =
    step?.activity === "pathSelect" && !!step.activityConfig?.pathSelect;
  const isSVGMultiSelect =
    step?.activity === "svgMultiSelect" &&
    (!!step.activityConfig?.svgOptions ||
      !!step.activityConfig?.svgMultiSelect?.options);

  // Logic to determine if any speech bubble will be rendered at the top
  const isGenericBubbleExcluded =
    isDialog ||
    isExplain ||
    isTextWithSVG ||
    isSimpleQuestion ||
    isSVGMultiSelect ||
    activityType === "questionWithSVG" ||
    activityType === "questionWithImage" ||
    isGraphQuestionActivity ||
    step.activity === "textWithSVG" ||
    step.activity === "textWithImageExplain" ||
    step.activity === "dragMatch" ||
    isPathSelect ||
    (activityType === "graphQuestionPNG" && graphQuestionPNGViewingExplanation);

  const hasSpecificBubble =
    (activityType === "graphQuestion" &&
      !!(
        showingDrillExplanation
          ? drillExplanation || step.message
          : step.message
      )?.trim()) ||
    (activityType === "graphQuestionPNG" &&
      !!(
        showingDrillExplanation
          ? drillExplanation || step.message
          : step.message
      )?.trim()) ||
    (step.activity === "svgMultiSelect" &&
      !!(
        showingDrillExplanation
          ? drillExplanation || step.message
          : step.message
      )?.trim()) ||
    ((step.activity as any) === "dragMatch" &&
      !!(
        showSimpleQuestionButtonSheet
          ? drillExplanation || step.message
          : step.message
      )?.trim()) ||
    (activityType === "questionWithSVG" &&
      !!(
        showingDrillExplanation
          ? drillExplanation || step.message
          : step.message
      )?.trim()) ||
    (activityType === "questionWithImage" &&
      !!(
        showingDrillExplanation
          ? drillExplanation || step.message
          : step.message ||
            (step.activityConfig as any)?.questionWithImage?.question
      )?.trim()) ||
    (isSimpleQuestion && !!step.message?.trim()) ||
    (isPathSelect &&
      pathSelectViewingOption === null &&
      !!step.message?.trim());

  const hasGenericBubble = !isGenericBubbleExcluded && !!step.message?.trim();
  const shouldShowBubbleContainer = hasSpecificBubble || hasGenericBubble;

  const [sessionCoins, setSessionCoins] = useState(0);
  const sessionCoinsRef = useRef(0);
  const sessionLightningsRef = useRef(0);
  const sessionGradedRef = useRef({ correctCount: 0, totalGraded: 0 });
  const lessonStartedAtRef = useRef(Date.now());

  const handleDrillComplete = (result: {
    isCorrect: boolean;
    explanation: string;
    numCorrectSelections?: number;
    correct?: boolean;
    numCorrect?: number;
    total?: number;
    rewards?: number;
  }) => {
    const rewards =
      result.rewards ||
      result.numCorrectSelections ||
      (result.correct ? 1 : 0) ||
      result.numCorrect ||
      0;
    const isCorrect = result.isCorrect || result.correct || false;
    const graded = countGradedFromDrillResult(result);
    sessionGradedRef.current = {
      correctCount: sessionGradedRef.current.correctCount + graded.correct,
      totalGraded: sessionGradedRef.current.totalGraded + graded.total,
    };

    if (rewards > 0) {
      sessionCoinsRef.current += rewards;
      sessionLightningsRef.current += rewards;
      setSessionCoins(sessionCoinsRef.current);
    }

    // For simple_question, questionWithSVG, questionWithImage, graphQuestion, sequenceBuild, dragMatch, and svgMultiSelect, show bottom sheet instead of generic explanation
    if (
      isSimpleQuestion ||
      isQuestionWithSVGActivity ||
      step.activity === "questionWithImage" ||
      step.activity === "sequenceBuild" ||
      (step.activity as any) === "dragMatch" ||
      step.activity === "svgMultiSelect"
    ) {
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
    console.log(
      "handleExplanationContinue called for step:",
      step.id,
      "activity:",
      step.activity,
    );
    console.log("step.choices:", step.choices);

    setShowingDrillExplanation(false);
    setDrillExplanation(null);
    setShowSimpleQuestionButtonSheet(false);

    // Navigate to next step based on choices[0].nextStep
    // For all drills including questionWithSVG, navigation choices are in step.choices (top level)
    if (step.choices && step.choices.length > 0 && step.choices[0]) {
      const nextStep = step.choices[0].nextStep;
      console.log(
        "handleExplanationContinue - nextStep:",
        nextStep,
        "from step:",
        step.id,
      );

      if (!nextStep) {
        console.warn(
          "handleExplanationContinue - nextStep is undefined/null in step.choices[0]",
        );
        console.warn("step.choices[0]:", step.choices[0]);
        return;
      }

      // Always navigate to the nextStep - let the natural flow handle lesson completion
      // Don't skip any steps just because nextStep is "intro"
      console.log(
        "handleExplanationContinue - Navigating to nextStep:",
        nextStep,
      );
      handleChoice(nextStep);
    } else {
      console.error(
        "handleExplanationContinue - No step.choices found for step:",
        step.id,
      );
      console.error("step object:", JSON.stringify(step, null, 2));
    }
  };

  const handleSimpleQuestionButtonSheetContinue = () => {
    setShowSimpleQuestionButtonSheet(false);

    // Reset graph viewing states
    setGraphQuestionViewingExplanation(false);
    setGraphQuestionSelectedChoiceId(null);
    setGraphQuestionPNGViewingExplanation(false);
    setGraphQuestionPNGSelectedChoiceId(null);

    // Navigate to next step
    if (
      selectedChoiceIdx !== null &&
      step.choices &&
      step.choices[selectedChoiceIdx]
    ) {
      const next = step.choices[selectedChoiceIdx].nextStep;
      setSelectedChoiceIdx(null);
      // Always navigate to the next step
      handleChoice(next);
    } else if (step.choices && step.choices.length > 0 && step.choices[0]) {
      // Fallback for activities that don't set selectedChoiceIdx (like graphQuestionPNG)
      handleChoice(step.choices[0].nextStep);
    }
  };

  const handleChoicePress = (choice: Choice) => {
    const dictionaryLink = getDictionaryLinkForChoice(
      choice,
      lessonId,
      step?.visual,
    );
    if (dictionaryLink) {
      openDictionary(dictionaryLink.topicId, dictionaryLink.termId);
    }
    handleChoice(choice.nextStep);
  };

  const handleChoice = (nextStep: string) => {
    if (stepTransitionLockRef.current) return;

    console.log(
      "handleChoice called with nextStep:",
      nextStep,
      "from current step:",
      stepId,
    );

    // If the next step is a known fail step, navigate to fail immediately
    if (nextStep === "wrong1") {
      console.log("Navigating to LessonFail");
      navigation.navigate("LessonFail");
      return;
    }

    // Check if lesson is complete (empty/undefined nextStep)
    if (!nextStep || nextStep === "") {
      // Empty nextStep means lesson is complete
      console.log("Empty nextStep, navigating to map");
      nextStep = "map";
    }

    // Find current step index and next step index to detect backwards navigation (loops)
    const currentStepIndex = currentLessonSteps.findIndex(
      (s) => s && s.id === stepId,
    );
    const nextStepIndices = currentLessonSteps
      .map((s, idx) => (s && s.id === nextStep ? idx : -1))
      .filter((idx) => idx !== -1);

    console.log(
      "Current step index:",
      currentStepIndex,
      "Next step indices:",
      nextStepIndices,
    );

    // If nextStep exists, check if we're going backwards (loop detection)
    if (nextStep && nextStep !== "map" && nextStepIndices.length > 0) {
      const lastNextStepIndex = nextStepIndices[nextStepIndices.length - 1]; // Get the LAST occurrence
      const firstNextStepIndex = nextStepIndices[0]; // Get the FIRST occurrence

      // ONLY detect as a loop if we've ACTUALLY visited that step AND we're going backwards
      // Don't just skip based on array position - that breaks lessons that reuse step IDs
      if (
        visitedStepsRef.current.has(nextStep) &&
        nextStep !== stepId &&
        currentStepIndex >= 0 &&
        firstNextStepIndex < currentStepIndex
      ) {
        // We've visited this step before AND we're going backwards in the array
        console.log(
          `Loop detected: trying to go to "${nextStep}" from "${stepId}", but we've already visited "${nextStep}" and going backwards`,
        );
        nextStep = "map";
      }
    }

    // Check if nextStep exists in steps
    const nextStepExists = currentLessonSteps.find(
      (s) => s && s.id === nextStep,
    );

    // If nextStep doesn't exist in steps, complete the lesson
    if (!nextStepExists && nextStep !== "map") {
      console.log(
        `Step "${nextStep}" not found in lesson steps, completing lesson`,
      );
      nextStep = "map";
    }

    if (nextStep === "map") {
      // Lesson is complete - start async operations immediately, then animate and navigate
      let shouldComplete = true;
      let shouldFail = false;
      // Special logic for quiz lesson: only complete if user answered correctly
      if (lessonId === 101) {
        if (stepId === "wrong1") {
          shouldComplete = false;
          shouldFail = true;
        }
      }

      // Start async operations immediately (don't wait for animations)
      if (shouldComplete && !shouldFail) {
        // Fire and forget - don't block navigation
        (async () => {
          try {
            await markLessonCompleted(lessonId);
          } catch (error: any) {
            console.error("Failed to save progress:", error);
            // Continue even if progress save fails
          }
        })();
      }

      // Animate progress to 100% first, then fade out, then navigate
      Animated.sequence([
        // Animate progress bar to 100% - user wants to see this complete
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // Then fade out quickly
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navigate after progress bar completes and fade out finishes
        if (shouldFail) {
          navigation.navigate("LessonFail");
        } else {
          navigation.navigate("LessonComplete", {
            lessonId,
            unitId: route.params?.unitId,
            coinsEarned: sessionCoinsRef.current,
            correctCount: sessionGradedRef.current.correctCount,
            totalGraded: sessionGradedRef.current.totalGraded,
            durationMs: Date.now() - lessonStartedAtRef.current,
            lightningsEarned: sessionLightningsRef.current,
          });
        }
      });

      return;
    }

    // Check if this step has points (correct answer) and should show bottom sheet
    const nextStepData = currentLessonSteps.find((s) => s && s.id === nextStep);
    if (nextStepData && nextStepData.points && nextStepData.points > 0) {
      // Show overlay but DON'T advance to next step yet - wait for bottom sheet interaction
      setShowCorrectOverlay(true);
      setPendingNextStep(nextStep);
      setAnswerMode("correct");
      setDrillRewards(nextStepData.points);
      return;
    }

    // Show Figma-like correct overlay for TA intro first question (legacy support)
    if (lessonId === 11 && stepId === "intro" && nextStep === "correct_def") {
      // Show overlay but DON'T advance to next step yet - wait for bottom sheet interaction
      setShowCorrectOverlay(true);
      setPendingNextStep(nextStep);
      setAnswerMode("correct");
      setDrillRewards(2); // Default reward for this specific case
      return;
    }

    // Navigate to next step in lesson
    console.log(`Navigating from "${stepId}" to "${nextStep}"`);
    runStepTransition(() => {
      setStepId(nextStep);
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
      ]),
    ).start();

    // Spin animation for loader
    Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const opacity = loadingAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  if (!lessonContentReady || currentLessonSteps.length === 0) {
    return (
      <LessonThemeProvider lesson={lessonMeta}>
        <LessonScreenBackground
          isPractice={isPractice}
          screenBg={visualTheme.screenBg}
          backgroundSource={backgroundImages.defaultBackground}
        >
          <TopBar />
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[styles.loadingCharacterContainer, { opacity }]}
            >
              <Image
                source={getCharacterImg("character_orange_noback.png")}
                style={styles.loadingCharacter}
              />
            </Animated.View>
            <View style={styles.loadingSpinnerContainer}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ActivityIndicator
                  size="large"
                  color={isPractice ? "#76D761" : "#3372D8"}
                />
              </Animated.View>
            </View>
            <Text
              style={[
                styles.loadingText,
                isPractice && { color: "#FFFFFF" },
              ]}
            >
              {preloadStatusText}
            </Text>
          </View>
        </LessonScreenBackground>
      </LessonThemeProvider>
    );
  }

  const choices = step.choices;

  const bgSource =
    backgroundImages[
      step.backgroundImage as keyof typeof backgroundImages
    ] || backgroundImages.defaultBackground;

  return (
    <LessonThemeProvider lesson={lessonMeta}>
      <LessonScreenBackground
        isPractice={isPractice}
        screenBg={visualTheme.screenBg}
        backgroundSource={bgSource}
      >
      <TopBar />
      <Animated.View
        style={[
          styles.content,
          !shouldShowBubbleContainer && { marginTop: 0 },
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {step.showInventory && step.inventory && (
          <Inventory inventory={step.inventory} />
        )}

        {/* Fixed Speech Bubble Container at Top */}
        {shouldShowBubbleContainer && (
          <View
            ref={speechBubbleContainerRef}
            style={styles.speechBubbleContainer}
            onLayout={(e) => {
              const height = e.nativeEvent.layout.height;
              setSpeechBubbleHeight(height);
            }}
          >
            {/* Text with image explain — title lives inside the drill card */}
            {activityType === "graphQuestion" &&
              (step.activityConfig as any)?.graphQuestion &&
              (() => {
                const bubbleMessage = showingDrillExplanation
                  ? drillExplanation || step.message
                  : step.message;
                if (!bubbleMessage || bubbleMessage.trim() === "") return null;
                return (
                  <SpeechBubble
                    message={bubbleMessage}
                    characterImg={
                      step.showCharacter !== false
                        ? getCharacterImg(step.characterImg)
                        : undefined
                    }
                    position={step.bubblePosition || "bottomLeft"}
                    align={
                      step.bubblePosition?.includes("Right")
                        ? "flex-end"
                        : step.bubblePosition?.includes("Left")
                          ? "flex-start"
                          : "center"
                    }
                    disableTyping
                    disableEnterAnim
                  />
                );
              })()}

            {activityType === "graphQuestionPNG" &&
              (step.activityConfig as any)?.graphQuestionPNG &&
              (() => {
                const bubbleMessage = showingDrillExplanation
                  ? drillExplanation || step.message
                  : step.message;
                if (!bubbleMessage || bubbleMessage.trim() === "") return null;
                return (
                  <SpeechBubble
                    message={bubbleMessage}
                    characterImg={
                      step.showCharacter !== false
                        ? getCharacterImg(step.characterImg)
                        : undefined
                    }
                    position={step.bubblePosition || "bottomLeft"}
                    align={
                      step.bubblePosition?.includes("Right")
                        ? "flex-end"
                        : step.bubblePosition?.includes("Left")
                          ? "flex-start"
                          : "center"
                    }
                    disableTyping
                    disableEnterAnim
                  />
                );
              })()}

            {/* Path select speech bubble */}
            {isPathSelect &&
              pathSelectViewingOption === null &&
              !!step.message?.trim() && (
                <SpeechBubble
                  message={step.message}
                  characterImg={
                    step.showCharacter !== false
                      ? getCharacterImg(step.characterImg)
                      : undefined
                  }
                  position={step.bubblePosition || "bottomLeft"}
                  align={
                    step.bubblePosition?.includes("Right")
                      ? "flex-end"
                      : step.bubblePosition?.includes("Left")
                        ? "flex-start"
                        : "center"
                  }
                  disableTyping
                  disableEnterAnim
                />
              )}

            {/* SVG MultiSelect speech bubble */}
            {step.activity === "svgMultiSelect" &&
              (step.activityConfig?.svgOptions ||
                step.activityConfig?.svgMultiSelect?.options) && (
                <SpeechBubble
                  message={
                    showingDrillExplanation
                      ? drillExplanation || step.message
                      : step.message
                  }
                  characterImg={
                    step.showCharacter !== false
                      ? getCharacterImg(step.characterImg)
                      : undefined
                  }
                  position={step.bubblePosition || "bottomLeft"}
                  align={
                    step.bubblePosition?.includes("Right")
                      ? "flex-end"
                      : step.bubblePosition?.includes("Left")
                        ? "flex-start"
                        : "center"
                  }
                  disableTyping
                  disableEnterAnim
                />
              )}

            {/* Drag-match speech bubble */}
            {(step.activity as any) === "dragMatch" &&
              step.activityConfig?.dragMatch &&
              (() => {
                // For dragMatch, show explanation when bottom sheet is showing, otherwise show initial message
                const bubbleMessage = showSimpleQuestionButtonSheet
                  ? drillExplanation || step.message
                  : step.message;
                // Only render if we have a message (SpeechBubble returns null for empty messages)
                if (
                  !bubbleMessage ||
                  (typeof bubbleMessage === "string" &&
                    bubbleMessage.trim() === "")
                ) {
                  return null;
                }
                return (
                  <SpeechBubble
                    message={bubbleMessage}
                    characterImg={
                      step.showCharacter !== false
                        ? getCharacterImg(step.characterImg)
                        : undefined
                    }
                    position={step.bubblePosition || "bottomLeft"}
                    align={
                      step.bubblePosition?.includes("Right")
                        ? "flex-end"
                        : step.bubblePosition?.includes("Left")
                          ? "flex-start"
                          : "center"
                    }
                    disableTyping
                    disableEnterAnim
                    randomPosition={true}
                  />
                );
              })()}

            {/* Question with SVG speech bubble */}
            {activityType === "questionWithSVG" &&
              step.activityConfig?.questionWithImage &&
              (() => {
                const bubbleMessage = showingDrillExplanation
                  ? drillExplanation || step.message
                  : step.message;
                if (
                  !bubbleMessage ||
                  typeof bubbleMessage !== "string" ||
                  bubbleMessage.trim() === ""
                )
                  return null;
                return (
                  <SpeechBubble
                    message={bubbleMessage}
                    characterImg={
                      step.showCharacter !== false
                        ? getCharacterImg(step.characterImg)
                        : undefined
                    }
                    position={step.bubblePosition || "bottomLeft"}
                    align={
                      step.bubblePosition?.includes("Right")
                        ? "flex-end"
                        : step.bubblePosition?.includes("Left")
                          ? "flex-start"
                          : "center"
                    }
                    disableTyping
                    disableEnterAnim
                    randomPosition={true}
                  />
                );
              })()}

            {/* Question with image speech bubble */}
            {activityType === "questionWithImage" &&
              step.activityConfig?.questionWithImage &&
              (() => {
                const bubbleMessage = showingDrillExplanation
                  ? drillExplanation || step.message
                  : step.message ||
                    step.activityConfig.questionWithImage.question;
                if (
                  !bubbleMessage ||
                  typeof bubbleMessage !== "string" ||
                  bubbleMessage.trim() === ""
                )
                  return null;
                return (
                  <SpeechBubble
                    message={bubbleMessage}
                    characterImg={
                      step.showCharacter !== false
                        ? getCharacterImg(step.characterImg)
                        : undefined
                    }
                    position={step.bubblePosition || "bottomLeft"}
                    align={
                      step.bubblePosition?.includes("Right")
                        ? "flex-end"
                        : step.bubblePosition?.includes("Left")
                          ? "flex-start"
                          : "center"
                    }
                    disableTyping
                    disableEnterAnim
                    randomPosition={true}
                  />
                );
              })()}

            {/* Generic speech bubble for drills without a dedicated bubble above */}
            {!isGenericBubbleExcluded &&
              (() => {
                const bubbleMessage = showingDrillExplanation
                  ? drillExplanation || step.message
                  : step.message;
                if (
                  !bubbleMessage ||
                  typeof bubbleMessage !== "string" ||
                  bubbleMessage.trim() === ""
                )
                  return null;
                return (
                  <SpeechBubble
                    message={bubbleMessage}
                    characterImg={
                      step.showCharacter !== false
                        ? getCharacterImg(step.characterImg)
                        : undefined
                    }
                    showCharacter={step.showCharacter !== false}
                    position={step.bubblePosition || "bottomLeft"}
                    align={
                      step.bubblePosition?.includes("Right")
                        ? "flex-end"
                        : step.bubblePosition?.includes("Left")
                          ? "flex-start"
                          : "center"
                    }
                    randomPosition={
                      step.activity?.includes("question") ||
                      step.activity?.includes("drill") ||
                      step.activity?.includes("Drill")
                    }
                    buttonText={
                      step.activity === "multiSelect" ||
                      step.activity === "svgMultiSelect" ||
                      step.activity === "carouselSelect" ||
                      step.activity === "sequenceBuild" ||
                      (step.activity as any) === "dragMatch" ||
                      step.activity === "pathSelect" ||
                      isExplanation
                        ? undefined
                        : showingDrillExplanation
                          ? "המשך"
                          : choices &&
                              choices.length === 1 &&
                              choices[0] &&
                              step.id !== "simple_text_step"
                            ? sanitizeDisplayText(choices[0].text)
                            : undefined
                    }
                    onButtonPress={
                      step.activity === "multiSelect" ||
                      step.activity === "svgMultiSelect" ||
                      step.activity === "carouselSelect" ||
                      step.activity === "sequenceBuild" ||
                      (step.activity as any) === "dragMatch" ||
                      step.activity === "pathSelect"
                        ? undefined
                        : showingDrillExplanation
                          ? handleExplanationContinue
                          : choices &&
                              choices.length === 1 &&
                              choices[0] &&
                              choices[0].nextStep &&
                              step.id !== "simple_text_step"
                            ? () => handleChoice(choices[0].nextStep)
                            : undefined
                    }
                  />
                );
              })()}

            {/* Simple question speech bubble */}
            {isSimpleQuestion &&
              (() => {
                const bubbleMessage = showingDrillExplanation
                  ? drillExplanation || step.message
                  : step.message;
                if (!bubbleMessage || bubbleMessage.trim() === "") return null;
                return (
                  <SpeechBubble
                    message={bubbleMessage}
                    characterImg={
                      step.showCharacter !== false
                        ? getCharacterImg(step.characterImg)
                        : undefined
                    }
                    showCharacter={step.showCharacter !== false}
                    position={step.bubblePosition || "bottomLeft"}
                    align={
                      step.bubblePosition?.includes("Right")
                        ? "flex-end"
                        : step.bubblePosition?.includes("Left")
                          ? "flex-start"
                          : "center"
                    }
                    randomPosition={true}
                    disableTyping
                    disableEnterAnim
                  />
                );
              })()}
          </View>
        )}

        {/* Text with image explanation - full screen when no message - positioned absolutely */}
        {step.activity === "textWithImageExplain" &&
          !step.message?.trim() &&
          (() => {
            if (!step.activityConfig?.questionWithImage) return null;

            const rawImageUrl =
              step.activityConfig.questionWithImage.uploadedImagePublicUrl ||
              step.activityConfig.questionWithImage.uploadedImageUrl ||
              step.activityConfig.questionWithImage.uploadedImage;
            const imageUrl = normalizeSupabaseUrl(rawImageUrl);

            return (
              <View style={styles.textWithImageFullScreen}>
                <TextWithImageExplainDrill
                  title=""
                  imageUrl={imageUrl}
                  stepId={step.id || "unknown"}
                  fullscreen
                />
              </View>
            );
          })()}

        {/* Graph question (PNG-based) drill - outside ScrollView */}
        {activityType === "graphQuestionPNG" &&
          (step.activityConfig as any)?.graphQuestionPNG &&
          !graphQuestionPNGViewingExplanation && (
            <DrillViewport style={styles.drillContentArea}>
              <View style={styles.mediaDrillWrapSized}>
              <GraphQuestionDrill
                mediaType="png"
                pngUrl={(step.activityConfig as any).graphQuestionPNG.pngUrl}
                choices={normalizeDrillChoices(
                  (step.activityConfig as any).graphQuestionPNG.choices,
                  step.choices,
                )}
                submitText={
                  (step.activityConfig as any).graphQuestionPNG.submitText ||
                  "בדוק"
                }
                correctExplanation={
                  (step.activityConfig as any).graphQuestionPNG
                    .correctExplanation
                }
                wrongExplanation={
                  (step.activityConfig as any).graphQuestionPNG.wrongExplanation
                }
                onSubmit={(result) => {
                  // Set state to show explanation screen instead of calling handleDrillComplete immediately
                  setGraphQuestionPNGSelectedChoiceId(result.selectedChoiceId);
                  setPendingGraphQuestionPNGResult(result);
                  setGraphQuestionPNGViewingExplanation(true);
                }}
                onSubmitTriggerRef={graphQuestionSubmitRef}
                onStateChange={(state) => {
                  setGraphQuestionCanSubmit(state.canSubmit);
                }}
              />
              </View>
            </DrillViewport>
          )}

        {/* Graph question PNG explanation screen */}
        {activityType === "graphQuestionPNG" &&
          (step.activityConfig as any)?.graphQuestionPNG &&
          graphQuestionPNGViewingExplanation && (
            <DrillViewport style={styles.drillContentArea}>
              {(() => {
                const selectedChoice = (
                  (step.activityConfig as any).graphQuestionPNG.choices || []
                ).find((c: any) => c.id === graphQuestionPNGSelectedChoiceId);
                if (!selectedChoice) return null;

                const isCorrect = selectedChoice.correct || false;
                const imageUrl =
                  selectedChoice.explanationImageUrl ||
                  selectedChoice.explanationImagePath ||
                  selectedChoice.pngUrl ||
                  selectedChoice.pngPath;

                return (
                  <View
                    style={{
                      width: "100%",
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      pointerEvents: "box-none",
                    }}
                  >
                    {(imageUrl ||
                      selectedChoice.explanationSvgCode ||
                      selectedChoice.explanationSvgUrl ||
                      selectedChoice.explanationSvgPublicUrl) && (
                      <View
                        style={{
                          width: "100%",
                          flex: 1,
                          maxHeight: 200,
                          position: "relative",
                          borderRadius: 12,
                          overflow: "hidden",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        {/* Show correct/wrong indicator inside container */}
                        <View
                          style={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            zIndex: 10,
                          }}
                        >
                          {!isCorrect && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <Text
                                style={{
                                  color: "#0D2033",
                                  fontWeight: "700",
                                  fontSize: 18,
                                }}
                              >
                                לא בדיוק
                              </Text>
                              <View
                                style={{
                                  backgroundColor: "#D92D20",
                                  borderRadius: 20,
                                  paddingHorizontal: 16,
                                  paddingVertical: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#FFFFFF",
                                    fontWeight: "700",
                                    fontSize: 14,
                                  }}
                                >
                                  ✗ שגוי
                                </Text>
                              </View>
                            </View>
                          )}
                          {isCorrect && (
                            <View
                              style={{
                                backgroundColor: "#12B76A",
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                              }}
                            >
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  fontWeight: "700",
                                  fontSize: 14,
                                }}
                              >
                                ✓ נכון
                              </Text>
                            </View>
                          )}
                        </View>
                        {/* Image/SVG - fill available space */}
                        {imageUrl && (
                          <Image
                            source={{ uri: imageUrl }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="contain"
                          />
                        )}
                        {(selectedChoice.explanationSvgCode ||
                          selectedChoice.explanationSvgUrl ||
                          selectedChoice.explanationSvgPublicUrl) &&
                          (() => {
                            const svgUrl =
                              selectedChoice.explanationSvgPublicUrl ||
                              selectedChoice.explanationSvgUrl;
                            const svgCode = selectedChoice.explanationSvgCode;

                            return (
                              <View
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {svgUrl ? (
                                  <SvgUri
                                    uri={svgUrl}
                                    width="100%"
                                    height="100%"
                                    preserveAspectRatio="xMidYMid meet"
                                  />
                                ) : svgCode ? (
                                  parseSVGCode(svgCode)
                                ) : null}
                              </View>
                            );
                          })()}
                      </View>
                    )}
                  </View>
                );
              })()}
            </DrillViewport>
          )}

        {isExplanation && (
          <DrillViewport style={styles.drillContentArea}>
            <ExplanationDrill step={step} />
            </DrillViewport>
          )}

        {/* Carousel select drill — centered in drill area */}
        {step.activity === "carouselSelect" &&
          step.activityConfig?.carousel && (
            <DrillViewport style={styles.drillContentArea}>
              <View style={styles.carouselDrillWrap}>
                <CarouselSelectDrill
                  items={step.activityConfig.carousel.items.map((i: any) => ({
                    id: i.id,
                    label: i.label,
                    imageKey: i.imageKey,
                    imageSource:
                      i.imageKey && characterImages[i.imageKey]
                        ? characterImages[i.imageKey]
                        : undefined,
                    svgCode: i.svgCode || undefined,
                    svgUrl: i.svgUrl || undefined,
                    svgPublicUrl: i.svgPublicUrl || undefined,
                    svgPath: i.svgPath || undefined,
                  }))}
                  correctId={step.activityConfig.carousel.correctId}
                  submitText={
                    step.activityConfig.carousel.submitText || "אישור"
                  }
                  correctExplanation={
                    step.activityConfig.carousel.correctExplanation
                  }
                  wrongExplanation={
                    step.activityConfig.carousel.wrongExplanation
                  }
                  onSubmit={handleDrillComplete}
                  showSubmitButton={false}
                  onSubmitTriggerRef={carouselSubmitRef}
                  onRetryTriggerRef={carouselRetryRef}
                  onStateChange={(state) => {
                    setCarouselFeedback((prev) =>
                      prev.showing === state.showingFeedback &&
                      prev.isCorrect === state.isCorrect
                        ? prev
                        : {
                            showing: state.showingFeedback,
                            isCorrect: state.isCorrect,
                          },
                    );
                  }}
                />
              </View>
            </DrillViewport>
          )}

        {!(step.activity === "textWithImageExplain" && !step.message?.trim()) &&
          !isExplanation &&
          !(activityType === "graphQuestionPNG") &&
          step.activity !== "carouselSelect" && (
            <DrillViewport style={styles.drillContentArea}>
              <View
                style={[
                  styles.drillContentInner,
                  (isSimpleQuestion ||
                    (step.activity === "pathSelect" &&
                      pathSelectViewingOption === null) ||
                    (activityType === "graphQuestion" &&
                      !graphQuestionViewingExplanation)) && {
                    justifyContent: "flex-start",
                    paddingTop: 6,
                  },
                ]}
              >
              {/* Text with image explanation activity - content only */}
              {step.activity === "textWithImageExplain" &&
                (() => {
                  // Debug: log if step is textWithImageExplain but missing config
                  if (
                    step.activity === "textWithImageExplain" &&
                    !step.activityConfig?.questionWithImage
                  ) {
                    console.warn(
                      "textWithImageExplain: Missing activityConfig.questionWithImage for step",
                      step.id,
                    );
                    return null;
                  }

                  if (!step.activityConfig?.questionWithImage) return null;

                  const rawImageUrl =
                    step.activityConfig.questionWithImage
                      .uploadedImagePublicUrl ||
                    step.activityConfig.questionWithImage.uploadedImageUrl ||
                    step.activityConfig.questionWithImage.uploadedImage;
                  const imageUrl = normalizeSupabaseUrl(rawImageUrl);

                  if (!imageUrl) {
                    console.warn(
                      "textWithImageExplain: No image URL found for step",
                      step.id,
                    );
                  }

                  if (!step.message?.trim() && !imageUrl) {
                    return null;
                  }

                  return (
                    <TextWithImageExplainDrill
                      title={step.message || ""}
                      imageUrl={imageUrl}
                      stepId={step.id || "unknown"}
                    />
                  );
                })()}

              <View style={styles.bubbleWrapper}>
                {/* Dialog activity */}
                {step.activity === "dialog" && step.activityConfig?.dialog && (
                  <Dialog
                    messages={step.activityConfig.dialog.messages}
                    typingSpeed={step.activityConfig.dialog.typingSpeed ?? 40}
                    autoAdvance={step.activityConfig.dialog.autoAdvance ?? true}
                    autoAdvanceDelay={
                      step.activityConfig.dialog.autoAdvanceDelay ?? 2000
                    }
                    onComplete={() => {
                      if (choices && choices.length === 1) {
                        handleChoice(choices[0].nextStep);
                      }
                    }}
                  />
                )}

                {/* Text with SVG explanation activity */}
                {step.activity === "textWithSVG" &&
                  step.activityConfig?.questionWithImage && (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <TextWithSVG
                        text={step.message}
                        svgCode={step.activityConfig.questionWithImage.svgCode}
                        svgUrl={step.activityConfig.questionWithImage.svgUrl}
                        svgPublicUrl={
                          step.activityConfig.questionWithImage.svgPublicUrl
                        }
                        submitText={
                          step.activityConfig.questionWithImage.submitText ||
                          "המשך"
                        }
                        onContinue={() => {
                          if (choices && choices.length >= 1) {
                            handleChoice(choices[0].nextStep);
                          }
                        }}
                        showButton={false}
                      />
                    </View>
                  )}

                {/* Question with image drill */}
                {step.activity === "questionWithImage" &&
                  step.activityConfig?.questionWithImage && (
                    <View
                      style={[styles.mediaDrillWrap, styles.mediaDrillWrapSized]}
                    >
                      <QuestionWithImage
                        question={
                          step.activityConfig.questionWithImage.question || ""
                        }
                        imageSource={
                          step.activityConfig.questionWithImage
                            .uploadedImagePublicUrl
                            ? {
                                uri: step.activityConfig.questionWithImage
                                  .uploadedImagePublicUrl,
                              }
                            : step.activityConfig.questionWithImage
                                  .uploadedImageUrl
                              ? {
                                  uri: step.activityConfig.questionWithImage
                                    .uploadedImageUrl,
                                }
                              : step.activityConfig.questionWithImage
                                    .uploadedImage
                                ? {
                                    uri: step.activityConfig.questionWithImage
                                      .uploadedImage,
                                  }
                                : require("../assets/DefaultBlankBackground.png")
                        }
                        choices={normalizeDrillChoices(
                          step.activityConfig.questionWithImage.choices,
                          step.choices,
                        )}
                        submitText={
                          step.activityConfig.questionWithImage.submitText ||
                          "בדוק"
                        }
                        correctExplanation={
                          step.activityConfig.questionWithImage
                            .correctExplanation
                        }
                        wrongExplanation={
                          step.activityConfig.questionWithImage.wrongExplanation
                        }
                        onSubmit={(result) => {
                          const rewards = result.isCorrect
                            ? step.activityConfig?.questionWithImage?.rewards ||
                              0
                            : 0;
                          handleDrillComplete({
                            ...result,
                            rewards,
                          });
                        }}
                        onSubmitTriggerRef={questionWithImageSubmitRef}
                        onStateChange={(state) => {
                          setQuestionWithImageCanSubmit(state.canSubmit);
                        }}
                      />
                    </View>
                  )}

                {/* Question with SVG drill */}
                {activityType === "questionWithSVG" &&
                  step.activityConfig?.questionWithImage &&
                  (() => {
                    const rawChoices =
                      step.activityConfig.questionWithImage.choices;
                    console.log(
                      "QuestionWithSVG: Rendering step",
                      step.id,
                      "with raw choices:",
                      rawChoices,
                    );

                    // Filter out any invalid choices (null, undefined, or missing id)
                    const validChoices = normalizeDrillChoices(
                      Array.isArray(rawChoices)
                        ? rawChoices.filter((c) => c && c.id)
                        : [],
                      step.choices,
                    ).filter((c) => getDrillChoicePlainText(c).length > 0);

                    if (validChoices.length === 0) {
                      console.error(
                        "QuestionWithSVG: No valid choices found for step",
                        step.id,
                        "rawChoices:",
                        rawChoices,
                      );
                      return null;
                    }

                    return (
                      <View
                        style={{
                          width: "100%",
                          paddingBottom: 120,
                        }}
                      >
                        <QuestionWithSVG
                          question={
                            step.activityConfig.questionWithImage.question || ""
                          }
                          svgCode={
                            step.activityConfig.questionWithImage.svgCode
                          }
                          svgUrl={step.activityConfig.questionWithImage.svgUrl}
                          svgPublicUrl={
                            step.activityConfig.questionWithImage.svgPublicUrl
                          }
                          choices={validChoices}
                          submitText={
                            step.activityConfig.questionWithImage.submitText ||
                            "בדוק"
                          }
                          correctExplanation={
                            step.activityConfig.questionWithImage
                              .correctExplanation
                          }
                          wrongExplanation={
                            step.activityConfig.questionWithImage
                              .wrongExplanation
                          }
                          onSubmitTriggerRef={questionSvgSubmitRef}
                          onStateChange={(state) => {
                            setQuestionSvgCanSubmit(state.canSubmit);
                          }}
                          onSubmit={(result) => {
                            const rewards = result.isCorrect
                              ? step.activityConfig?.questionWithImage
                                  ?.rewards || 0
                              : 0;
                            handleDrillComplete({
                              ...result,
                              rewards,
                            });
                          }}
                        />
                      </View>
                    );
                  })()}

                {/* Graph question (SVG-based) drill - Main Screen */}
                {activityType === "graphQuestion" &&
                  (step.activityConfig as any)?.graphQuestion &&
                  !graphQuestionViewingExplanation && (
                    <View style={styles.mediaDrillWrapSized}>
                      <GraphQuestionDrill
                        mediaType="svg"
                        svgCode={
                          (step.activityConfig as any).graphQuestion.svgCode
                        }
                        svgUrl={
                          (step.activityConfig as any).graphQuestion.svgUrl
                        }
                        svgPublicUrl={
                          (step.activityConfig as any).graphQuestion
                            .svgPublicUrl
                        }
                        choices={normalizeDrillChoices(
                          (step.activityConfig as any).graphQuestion.choices,
                          step.choices,
                        )}
                        submitText={
                          (step.activityConfig as any).graphQuestion
                            .submitText || "בדוק"
                        }
                        correctExplanation={
                          (step.activityConfig as any).graphQuestion
                            .correctExplanation
                        }
                        wrongExplanation={
                          (step.activityConfig as any).graphQuestion
                            .wrongExplanation
                        }
                        onSubmit={(result) => {
                          // Set state to show explanation screen instead of calling handleDrillComplete immediately
                          setGraphQuestionSelectedChoiceId(
                            result.selectedChoiceId,
                          );
                          setGraphQuestionViewingExplanation(true);
                        }}
                        onSubmitTriggerRef={graphQuestionSubmitRef}
                        onStateChange={(state) => {
                          setGraphQuestionCanSubmit(state.canSubmit);
                        }}
                      />
                    </View>
                  )}

                {/* Graph question SVG explanation screen */}
                {activityType === "graphQuestion" &&
                  (step.activityConfig as any)?.graphQuestion &&
                  graphQuestionViewingExplanation &&
                  (() => {
                    const selectedChoice = (
                      (step.activityConfig as any).graphQuestion.choices || []
                    ).find((c: any) => c.id === graphQuestionSelectedChoiceId);
                    if (!selectedChoice) return null;

                    const isCorrect = selectedChoice.correct || false;
                    const imageUrl =
                      selectedChoice.explanationImageUrl ||
                      selectedChoice.explanationImagePath;

                    // Fallback to main graph SVG if no explanation SVG is provided
                    const explanationSvgCode =
                      selectedChoice.explanationSvgCode ||
                      (step.activityConfig as any).graphQuestion.svgCode;
                    const explanationSvgUrl =
                      selectedChoice.explanationSvgUrl ||
                      (step.activityConfig as any).graphQuestion.svgUrl;
                    const explanationSvgPublicUrl =
                      selectedChoice.explanationSvgPublicUrl ||
                      (step.activityConfig as any).graphQuestion.svgPublicUrl;

                    console.log(
                      "GraphQuestion Explanation - selectedChoice:",
                      selectedChoice,
                    );
                    console.log(
                      "GraphQuestion Explanation - imageUrl:",
                      imageUrl,
                    );
                    console.log(
                      "GraphQuestion Explanation - SVG Code:",
                      explanationSvgCode ? "exists" : "missing",
                    );
                    console.log(
                      "GraphQuestion Explanation - SVG URL:",
                      explanationSvgUrl || explanationSvgPublicUrl,
                    );

                    return (
                      <View
                        style={{
                          width: "100%",
                          flex: 1,
                          justifyContent: "flex-start",
                          alignItems: "center",
                          paddingTop: 10,
                          paddingBottom: 100,
                          pointerEvents: "box-none",
                        }}
                      >
                        {/* Image/SVG container with indicator inside */}
                        {(imageUrl ||
                          explanationSvgCode ||
                          explanationSvgUrl ||
                          explanationSvgPublicUrl) && (
                          <View
                            style={{
                              width: "100%",
                              flex: 1,
                              maxHeight: "75%",
                              position: "relative",
                              borderRadius: 12,
                              overflow: "hidden",
                              backgroundColor: "#f5f5f5",
                            }}
                          >
                            {/* Show correct/wrong indicator inside container */}
                            <View
                              style={{
                                position: "absolute",
                                top: 16,
                                right: 16,
                                zIndex: 10,
                              }}
                            >
                              {!isCorrect && (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#0D2033",
                                      fontWeight: "700",
                                      fontSize: 18,
                                    }}
                                  >
                                    לא בדיוק
                                  </Text>
                                  <View
                                    style={{
                                      backgroundColor: "#D92D20",
                                      borderRadius: 20,
                                      paddingHorizontal: 16,
                                      paddingVertical: 8,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "#FFFFFF",
                                        fontWeight: "700",
                                        fontSize: 14,
                                      }}
                                    >
                                      ✗ שגוי
                                    </Text>
                                  </View>
                                </View>
                              )}
                              {isCorrect && (
                                <View
                                  style={{
                                    backgroundColor: "#12B76A",
                                    borderRadius: 20,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#FFFFFF",
                                      fontWeight: "700",
                                      fontSize: 14,
                                    }}
                                  >
                                    ✓ נכון
                                  </Text>
                                </View>
                              )}
                            </View>
                            {/* Image/SVG - fill available space */}
                            {imageUrl && (
                              <Image
                                source={{ uri: imageUrl }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                              />
                            )}
                            {(explanationSvgCode ||
                              explanationSvgUrl ||
                              explanationSvgPublicUrl) &&
                              (() => {
                                const svgUrl =
                                  explanationSvgPublicUrl || explanationSvgUrl;
                                const svgCode = explanationSvgCode;

                                return (
                                  <View
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {svgUrl ? (
                                      <SvgUri
                                        uri={svgUrl}
                                        width="100%"
                                        height="100%"
                                        preserveAspectRatio="xMidYMid meet"
                                      />
                                    ) : svgCode ? (
                                      parseSVGCode(svgCode)
                                    ) : null}
                                  </View>
                                );
                              })()}
                          </View>
                        )}
                      </View>
                    );
                  })()}

                {/* Render candlestick SVG if visual is set */}
                {step.visual === "hammer" && (
                  <View style={styles.candleSvgWrapper}>
                    <HammerCandleSVG width={60} height={120} />
                  </View>
                )}
                {step.visual === "bullish" && (
                  <View style={styles.candleSvgWrapper}>
                    <BullishCandleSVG width={36} height={110} />
                  </View>
                )}
                {step.visual === "bearish" && (
                  <View style={styles.candleSvgWrapper}>
                    <BearishCandleSVG width={36} height={110} />
                  </View>
                )}
                {step.visual === "doji" && (
                  <View style={styles.candleSvgWrapper}>
                    <DojiCandleSVG width={50} height={80} />
                  </View>
                )}

                {/* New candle patterns */}
                {step.visual === "dragonflyCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <DragonflyDoji width={60} height={120} />
                  </View>
                )}
                {step.visual === "dojiCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <Doji width={60} height={120} />
                  </View>
                )}
                {step.visual === "bullishEngulfingCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <BullishEngulfing width={120} height={120} />
                  </View>
                )}
                {step.visual === "bearishEngulfingCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <BearishEngulfing width={120} height={120} />
                  </View>
                )}
                {step.visual === "bullishHaramiCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <BullishEngulfing width={120} height={120} />
                  </View>
                )}
                {step.visual === "bearishHaramiCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <BearishEngulfing width={120} height={120} />
                  </View>
                )}
                {step.visual === "threeInsideUpCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <BullishEngulfing width={120} height={120} />
                  </View>
                )}
                {step.visual === "threeInsideDownCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <BearishEngulfing width={120} height={120} />
                  </View>
                )}
                {step.visual === "shootingStarDayCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <ShootingStar width={60} height={120} />
                  </View>
                )}
                {step.visual === "shootingStarEveningCandle" && (
                  <View style={styles.candleSvgWrapper}>
                    <ShootingStar width={60} height={120} />
                  </View>
                )}

                {/* New visual types for the redesigned lessons */}
                {step.visual === "dragonflyTrend" && (
                  <View style={styles.candleSvgWrapper}>
                    <DragonflyDoji width={60} height={120} />
                  </View>
                )}
                {step.visual === "dragonflyReversal" && (
                  <View style={styles.candleSvgWrapper}>
                    <DragonflyDoji width={60} height={120} />
                  </View>
                )}
                {step.visual === "regularDoji" && (
                  <View style={styles.candleSvgWrapper}>
                    <RegularDoji width={60} height={80} />
                  </View>
                )}
                {step.visual === "invertedHammerNew" && (
                  <View style={styles.candleSvgWrapper}>
                    <InvertedHammerNew width={60} height={120} />
                  </View>
                )}
                {step.visual === "dojiUptrend" && (
                  <View style={styles.candleSvgWrapper}>
                    <DojiLessonVisuals
                      type="uptrend"
                      width={300}
                      height={200}
                    />
                  </View>
                )}
                {step.visual === "dojiReversal" && (
                  <View style={styles.candleSvgWrapper}>
                    <DojiLessonVisuals
                      type="reversal"
                      width={300}
                      height={200}
                    />
                  </View>
                )}
                {step.visual === "dojiIntro" && (
                  <View style={styles.candleSvgWrapper}>
                    <DojiLessonVisuals type="intro" width={300} height={200} />
                  </View>
                )}
                {step.visual === "dojiDefinition" && (
                  <View style={styles.candleSvgWrapper}>
                    <DojiLessonVisuals
                      type="definition"
                      width={300}
                      height={200}
                    />
                  </View>
                )}
                {step.visual === "dojiCharacteristics" && (
                  <View style={styles.candleSvgWrapper}>
                    <DojiLessonVisuals
                      type="characteristics"
                      width={300}
                      height={200}
                    />
                  </View>
                )}
                {step.visual === "dojiRule" && (
                  <View style={styles.candleSvgWrapper}>
                    <DojiLessonVisuals type="rule" width={300} height={200} />
                  </View>
                )}
                {step.visual === "dojiSummary" && (
                  <View style={styles.candleSvgWrapper}>
                    <DojiLessonVisuals
                      type="summary"
                      width={300}
                      height={200}
                    />
                  </View>
                )}
                {/* MultiSelect drill */}
                {step.activity === "multiSelect" &&
                  step.activityConfig?.options && (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <MultiSelectDrill
                        options={step.activityConfig.options.map((o) => ({
                          id: o.id,
                          label: o.label,
                          imageSource: o.imageKey
                            ? characterImages[o.imageKey]
                            : undefined,
                          correct: o.correct,
                        }))}
                        layout={step.activityConfig.layout || "grid"}
                        submitText={step.activityConfig.submitText || "בדוק"}
                        correctExplanation={
                          step.activityConfig.correctExplanation
                        }
                        wrongExplanation={step.activityConfig.wrongExplanation}
                        onSubmit={handleDrillComplete}
                      />
                    </View>
                  )}

                {/* SVG MultiSelect drill */}
                {step.activity === "svgMultiSelect" &&
                  (step.activityConfig?.svgOptions ||
                    step.activityConfig?.svgMultiSelect?.options) && (
                    <View
                      style={[
                        styles.mediaDrillWrap,
                        (() => {
                          const opts =
                            step.activityConfig?.svgOptions ||
                            step.activityConfig?.svgMultiSelect?.options ||
                            [];
                          const yesNo =
                            opts.length === 2 &&
                            opts.filter((o: { correct?: boolean }) => o.correct)
                              .length === 1;
                          return yesNo
                            ? styles.mediaDrillWrapYesNo
                            : styles.mediaDrillWrapSized;
                        })(),
                      ]}
                    >
                      <SVGMultiSelectDrill
                        options={(
                          step.activityConfig.svgOptions ||
                          step.activityConfig.svgMultiSelect?.options ||
                          []
                        ).map((o: any) => ({
                          id: o.id,
                          label: o.label,
                          svgCode: o.svgCode || undefined,
                          svgUrl: o.svgUrl || undefined,
                          svgPublicUrl: o.svgPublicUrl || undefined,
                          svgPath: o.svgPath || undefined,
                          pngUrl: o.pngUrl || undefined,
                          pngPublicUrl: o.pngPublicUrl || undefined,
                          pngPath: o.pngPath || undefined,
                          inputType: o.inputType || "svg",
                          correct: o.correct,
                        }))}
                        layout={
                          step.activityConfig.layout ||
                          step.activityConfig.svgMultiSelect?.layout ||
                          "grid"
                        }
                        submitText={
                          step.activityConfig.submitText ||
                          step.activityConfig.svgMultiSelect?.submitText ||
                          "בדוק"
                        }
                        correctExplanation={
                          step.activityConfig.correctExplanation ||
                          step.activityConfig.svgMultiSelect?.correctExplanation
                        }
                        wrongExplanation={
                          step.activityConfig.wrongExplanation ||
                          step.activityConfig.svgMultiSelect?.wrongExplanation
                        }
                        onSubmit={(result) => {
                          // Extract rewards from activityConfig, similar to simple_question
                          const rewards = result.isCorrect
                            ? step.activityConfig?.rewards ||
                              step.activityConfig?.svgMultiSelect?.rewards ||
                              0
                            : 0;
                          handleDrillComplete({
                            ...result,
                            rewards,
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
                  )}

                {/* Drag-match drill */}
                {(step.activity as any) === "dragMatch" &&
                  step.activityConfig?.dragMatch && (
                    <View
                      style={{
                        marginTop: 30,
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <DragMatchDrill
                        slots={step.activityConfig.dragMatch.slots
                          .filter((s) => s && s.id)
                          .map((s) => ({
                            id: s.id,
                            drawKey: s.drawKey as any,
                            imageSource: s.imageKey
                              ? characterImages[s.imageKey]
                              : undefined,
                            labelBelow: s.labelBelow,
                            svgCode: s.svgCode,
                            svgUrl: s.svgUrl,
                            svgPublicUrl: s.svgPublicUrl,
                            svgPath: s.svgPath,
                          }))}
                        tokens={step.activityConfig.dragMatch.tokens}
                        submitText={
                          step.activityConfig.dragMatch.submitText || "אישור"
                        }
                        correctExplanation={
                          step.activityConfig.dragMatch.correctExplanation
                        }
                        wrongExplanation={
                          step.activityConfig.dragMatch.wrongExplanation
                        }
                        onSubmit={(result) => {
                          // Extract rewards from activityConfig (rewards might be at top level or in dragMatch)
                          const rewards = result.isCorrect
                            ? (step.activityConfig as any)?.dragMatch
                                ?.rewards ||
                              (step.activityConfig as any)?.rewards ||
                              0
                            : 0;
                          handleDrillComplete({
                            ...result,
                            rewards,
                          });
                        }}
                        onSubmitTriggerRef={dragMatchSubmitRef}
                        onStateChange={(state) => {
                          setDragMatchCanSubmit(state.canSubmit);
                          // showingExplanation is handled by handleDrillComplete setting showingDrillExplanation
                        }}
                      />
                    </View>
                  )}

                {/* Sequence build drill */}
                {step.activity === "sequenceBuild" &&
                  step.activityConfig?.sequenceBuild && (
                    <View
                      style={{
                        marginTop: 30,
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <SequenceBuildDrill
                        slotsCount={
                          step.activityConfig.sequenceBuild.slotsCount
                        }
                        options={step.activityConfig.sequenceBuild.options}
                        correctSequence={
                          step.activityConfig.sequenceBuild.correctSequence
                        }
                        correctSequences={
                          step.activityConfig.sequenceBuild.correctSequences
                        }
                        submitText={
                          step.activityConfig.sequenceBuild.submitText ||
                          "אישור"
                        }
                        correctExplanation={
                          step.activityConfig.sequenceBuild.correctExplanation
                        }
                        wrongExplanation={
                          step.activityConfig.sequenceBuild.wrongExplanation
                        }
                        onSubmit={handleDrillComplete}
                        onSubmitTriggerRef={sequenceBuildSubmitRef}
                        onStateChange={(state) => {
                          setSequenceBuildCanSubmit(state.canSubmit);
                          setShowingDrillExplanation(state.showingExplanation);
                        }}
                      />
                    </View>
                  )}

                {/* Path Select drill */}
                {step.activity === "pathSelect" &&
                  step.activityConfig?.pathSelect && (
                    <>
                      {pathSelectViewingOption ? (
                        // Show explanation for selected option
                        (() => {
                          const selectedOption =
                            step.activityConfig.pathSelect.choices.find(
                              (c: any) => c.id === pathSelectViewingOption,
                            );
                          if (!selectedOption) return null;

                          // Build ordered list of explanation "screens" for this option.
                          // First screen comes from the legacy single-explanation fields,
                          // followed by any extraExplanations if present.
                          const baseScreen = {
                            explanation: selectedOption.explanation || "",
                            imageUrl:
                              selectedOption.explanationImageUrl ||
                              selectedOption.explanationImagePath,
                            svgCode: selectedOption.explanationSvgCode,
                            svgUrl: selectedOption.explanationSvgUrl,
                            svgPublicUrl:
                              selectedOption.explanationSvgPublicUrl,
                            isComplexMedia: (selectedOption as any)
                              .isComplexMedia,
                          };

                          const extraScreens =
                            (selectedOption.extraExplanations || []).map(
                              (ex: any) => ({
                                explanation: ex.explanation || "",
                                imageUrl:
                                  ex.explanationImageUrl ||
                                  ex.explanationImagePath,
                                svgCode: ex.explanationSvgCode,
                                svgUrl: ex.explanationSvgUrl,
                                svgPublicUrl: ex.explanationSvgPublicUrl,
                                isComplexMedia: ex.isComplexMedia,
                              }),
                            ) || [];

                          const allScreens = [
                            // Only include base screen if it has any content
                            ...(baseScreen.explanation ||
                            baseScreen.imageUrl ||
                            baseScreen.svgCode ||
                            baseScreen.svgUrl ||
                            baseScreen.svgPublicUrl ||
                            baseScreen.isComplexMedia
                              ? [baseScreen]
                              : []),
                            ...extraScreens,
                          ];

                          const currentScreen =
                            allScreens[pathSelectViewingScreenIndex] ||
                            allScreens[0];

                          // Debug logging
                          console.log(
                            "PathSelectExplanation - currentScreen:",
                            {
                              explanation: currentScreen?.explanation,
                              imageUrl: currentScreen?.imageUrl,
                              hasImageUrl: !!currentScreen?.imageUrl,
                              svgCode: currentScreen?.svgCode
                                ? `exists (${currentScreen.svgCode.length} chars)`
                                : "none",
                              svgUrl: currentScreen?.svgUrl,
                              svgPublicUrl: currentScreen?.svgPublicUrl,
                              selectedOption: {
                                explanationImageUrl:
                                  selectedOption?.explanationImageUrl,
                                explanationImagePath:
                                  selectedOption?.explanationImagePath,
                                explanationSvgCode:
                                  selectedOption?.explanationSvgCode
                                    ? `exists (${selectedOption.explanationSvgCode.length} chars)`
                                    : "none",
                                explanationSvgUrl:
                                  selectedOption?.explanationSvgUrl,
                                explanationSvgPublicUrl:
                                  selectedOption?.explanationSvgPublicUrl,
                              },
                            },
                          );

                          return (
                            <>
                              <View
                                style={{
                                  width: "100%",
                                  flex: 1,
                                  marginTop: 0,
                                }}
                              >
                                <PathSelectExplanation
                                  explanation={currentScreen?.explanation || ""}
                                  imageUrl={currentScreen?.imageUrl}
                                  svgCode={currentScreen?.svgCode}
                                  svgUrl={currentScreen?.svgUrl}
                                  svgPublicUrl={currentScreen?.svgPublicUrl}
                                  isComplexMedia={currentScreen?.isComplexMedia}
                                />
                              </View>
                            </>
                          );
                        })()
                      ) : (
                        // Show main path selection drill
                        <>
                          <View style={styles.pathSelectDrillWrap}>
                            <PathSelectDrill
                              options={
                                step.activityConfig.pathSelect.choices || []
                              }
                              submitText={
                                step.activityConfig.pathSelect.submitText ||
                                "המשך"
                              }
                              onOptionSelect={(optionId) => {
                                // Reset to first screen whenever a new option is selected
                                setPathSelectViewingScreenIndex(0);
                                setPathSelectViewingOption(optionId);
                              }}
                              onContinue={() => {
                                // Proceed to next step
                                if (
                                  choices &&
                                  choices.length > 0 &&
                                  choices[0].nextStep
                                ) {
                                  handleChoice(choices[0].nextStep);
                                }
                              }}
                              completedOptions={pathSelectCompletedOptions}
                            />
                          </View>
                        </>
                      )}
                    </>
                  )}

                {isSimpleQuestion && choices && choices.length > 0 && (
                  <SimpleQuestionChoiceList
                    choices={choices as SimpleChoice[]}
                    selectedChoiceIdx={selectedChoiceIdx}
                    isSubmitted={
                      showSimpleQuestionButtonSheet || showingDrillExplanation
                    }
                    onSelect={setSelectedChoiceIdx}
                    theme={visualTheme}
                  />
                )}
              </View>
              </View>
            </DrillViewport>
          )}
        {/* Choices: hidden during dialog/explain/textWithSVG/pathSelect/questionWithImage/graphQuestionPNG to reduce clutter */}
        {!(
          isDialog ||
          isExplain ||
          isTextWithSVG ||
          step.activity === "pathSelect" ||
          activityType === "questionWithImage" ||
          isGraphQuestionActivity
        ) &&
          !isSimpleQuestion && (
            <View style={styles.choices}>
              {choices && choices.length > 1 && (
                <>
                  {choices.map((choice, idx) => (
                    <Pressable
                      key={choice.text}
                      onPress={() => setSelectedChoiceIdx(idx)}
                      style={({ pressed }) => [
                        styles.choiceCard,
                        pressed && { transform: [{ scale: 0.985 }] },
                        selectedChoiceIdx === idx && styles.choiceCardSelected,
                        answerMode === "correct" &&
                          idx === selectedChoiceIdx &&
                          styles.choiceCardCorrect,
                      ]}
                    >
                      <DrillChoiceLabel
                        choice={choice}
                        color={
                          selectedChoiceIdx === idx
                            ? "#FFFFFF"
                            : "#0D2033"
                        }
                        style={[
                          styles.choiceText,
                          selectedChoiceIdx === idx
                            ? styles.choiceTextSelected
                            : undefined,
                          answerMode === "correct" &&
                          idx === selectedChoiceIdx
                            ? styles.choiceTextCorrect
                            : undefined,
                        ]}
                      />
                    </Pressable>
                  ))}
                  {selectedChoiceIdx !== null && (
                    <Pressable
                      style={styles.primaryButton}
                      onPress={() => {
                        const choice = choices[selectedChoiceIdx!];
                        setSelectedChoiceIdx(null);
                        handleChoicePress(choice);
                      }}
                    >
                      <Text style={styles.primaryButtonText}>אישור</Text>
                    </Pressable>
                  )}
                </>
              )}
              {!isSimpleQuestion &&
                !isSVGMultiSelect &&
                step.activity !== "questionWithSVG" &&
                (step.activity as any) !== "dragMatch" &&
                step.activity !== "carouselSelect" &&
                step.activity !== "multiSelect" &&
                step.activity !== "sequenceBuild" &&
                !isGraphQuestionActivity &&
                !isExplanation &&
                choices &&
                choices.length === 1 &&
                step.id !== "simple_text_step" && (
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => handleChoicePress(choices[0])}
                  >
                    <Text style={styles.primaryButtonText}>
                      {sanitizeDisplayText(choices[0].text || "המשך")}
                    </Text>
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
              {drillRewards > 0 ? "תשובה נכונה!" : "תשובה שגויה"}
            </Text>
            <View style={styles.rewardPill}>
              <Text
                style={styles.rewardPillText}
              >{`⚡ X ${drillRewards} - זכית ב־`}</Text>
            </View>
            <Pressable
              style={[
                styles.nextButton,
                isPractice && {
                  backgroundColor: visualTheme.continueButtonCorrectBg,
                },
              ]}
              onPress={() => {
                setShowCorrectOverlay(false);
                if (pendingNextStep) {
                  const next = pendingNextStep;
                  setPendingNextStep(null);
                  handleChoice(next);
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
      {/* Absolute submit button for simple_question (same position as other drills) */}
      {isSimpleQuestion &&
        !showSimpleQuestionButtonSheet &&
        selectedChoiceIdx !== null &&
        !showCorrectOverlay && (
          <View style={styles.absoluteContinueButton}>
            <Pressable
              style={[
                styles.continueButton,
                isPractice && { backgroundColor: visualTheme.confirmButtonBg },
              ]}
              onPress={() => {
                // Submit logic
                if (
                  selectedChoiceIdx !== null &&
                  choices &&
                  choices[selectedChoiceIdx]
                ) {
                  const selectedChoice = choices[selectedChoiceIdx] as any;
                  const correct = selectedChoice?.correct === true;
                  const explanation = correct
                    ? step.activityConfig?.correctExplanation || "נכון!"
                    : step.activityConfig?.wrongExplanation ||
                      "לא נכון, נסה שוב";

                  const rewards = correct
                    ? step.activityConfig?.rewards || 0
                    : 0;
                  handleDrillComplete({
                    isCorrect: correct,
                    explanation,
                    correct,
                    numCorrect: correct ? 1 : 0,
                    total: 1,
                    rewards,
                  });
                }
              }}
            >
              <Text style={styles.continueButtonText}>בדוק</Text>
            </Pressable>
          </View>
        )}
      {/* Button sheet for simple_question, questionWithSVG, questionWithImage, sequenceBuild, dragMatch, and svgMultiSelect */}
      {showSimpleQuestionButtonSheet &&
        (isSimpleQuestion ||
          isQuestionWithSVGActivity ||
          step.activity === "questionWithImage" ||
          step.activity === "sequenceBuild" ||
          (step.activity as any) === "dragMatch" ||
          step.activity === "svgMultiSelect") && (
          <View style={styles.buttonSheetContainer}>
            <View style={styles.buttonSheet}>
              <Text
                style={[
                  styles.buttonSheetTitle,
                  simpleQuestionIsCorrect
                    ? styles.buttonSheetTitleCorrect
                    : styles.buttonSheetTitleWrong,
                ]}
              >
                {simpleQuestionIsCorrect ? "תשובה נכונה!" : "טעות"}
              </Text>
              {simpleQuestionIsCorrect && drillRewards > 0 && (
                <View style={styles.buttonSheetRewardRow}>
                  <Text style={styles.buttonSheetRewardText}>
                    {isPractice
                      ? `זכית ב- ${drillRewards} ⚡`
                      : `הרווחת ${drillRewards}$`}
                  </Text>
                </View>
              )}
              <View style={styles.buttonSheetButtonWrapper}>
                <Pressable
                  style={[
                    styles.continueButton,
                    simpleQuestionIsCorrect
                      ? isPractice
                        ? { backgroundColor: visualTheme.continueButtonCorrectBg }
                        : styles.continueButtonCorrect
                      : isPractice
                        ? { backgroundColor: visualTheme.continueButtonWrongBg }
                        : styles.continueButtonWrong,
                  ]}
                  onPress={() => {
                    console.log("Bottom sheet continue button pressed");
                    console.log(
                      "isQuestionWithSVGActivity:",
                      isQuestionWithSVGActivity,
                    );
                    console.log("step.activity:", step.activity);
                    if (
                      isQuestionWithSVGActivity ||
                      step.activity === "questionWithImage" ||
                      step.activity === "sequenceBuild" ||
                      (step.activity as any) === "dragMatch" ||
                      step.activity === "svgMultiSelect"
                    ) {
                      handleExplanationContinue();
                    } else {
                      handleSimpleQuestionButtonSheetContinue();
                    }
                  }}
                >
                  <Text style={styles.continueButtonText}>
                    {isPractice ? "שאלה הבאה" : "המשך"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      {/* Absolute continue button for textWithImageExplain */}
      {step.activity === "textWithImageExplain" &&
        step.activityConfig?.questionWithImage &&
        !showCorrectOverlay && (
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
                {step.activityConfig.questionWithImage.submitText || "המשך"}
              </Text>
            </Pressable>
          </View>
        )}
      {/* Absolute continue button for textWithSVG */}
      {step.activity === "textWithSVG" &&
        step.activityConfig?.questionWithImage &&
        !showCorrectOverlay && (
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
                {step.activityConfig.questionWithImage.submitText || "המשך"}
              </Text>
            </Pressable>
          </View>
        )}
      {/* Static button for svgMultiSelect - using choices pattern like other drills */}
      {step.activity === "svgMultiSelect" &&
        (step.activityConfig?.svgOptions ||
          step.activityConfig?.svgMultiSelect?.options) &&
        !showSimpleQuestionButtonSheet &&
        !showCorrectOverlay &&
        choices &&
        choices.length === 1 &&
        (svgMultiSelectCanSubmit || showingDrillExplanation) && (
          <View style={styles.absoluteContinueButton}>
            <Pressable
              style={styles.continueButton}
              onPress={() => {
                if (showingDrillExplanation) {
                  // Continue to next step
                  handleExplanationContinue();
                } else if (
                  svgMultiSelectSubmitRef.current &&
                  svgMultiSelectCanSubmit
                ) {
                  // Trigger submit from drill component
                  svgMultiSelectSubmitRef.current();
                }
              }}
              disabled={!showingDrillExplanation && !svgMultiSelectCanSubmit}
            >
              <Text style={styles.continueButtonText}>
                {showingDrillExplanation
                  ? "המשך"
                  : step.activityConfig.submitText || "בדוק"}
              </Text>
            </Pressable>
          </View>
        )}

      {/* Static button for carouselSelect drill using the shared absolute pattern */}
      {step.activity === "carouselSelect" &&
        step.activityConfig?.carousel &&
        !showSimpleQuestionButtonSheet &&
        !showCorrectOverlay &&
        choices &&
        choices.length === 1 && (
          <View style={styles.absoluteContinueButton}>
            {carouselFeedback.showing &&
            !carouselFeedback.isCorrect &&
            !showingDrillExplanation ? (
              <View style={styles.carouselActionRow}>
                <Pressable
                  style={styles.tryAgainButton}
                  onPress={() => carouselRetryRef.current?.()}
                >
                  <Text style={styles.tryAgainButtonText}>נסה שוב</Text>
                </Pressable>
                <Pressable
                  style={styles.continueButton}
                  onPress={() => carouselSubmitRef.current?.()}
                >
                  <Text style={styles.continueButtonText}>המשך</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[
                  styles.continueButton,
                  isPractice &&
                    !carouselFeedback.showing && {
                      backgroundColor: visualTheme.confirmButtonBg,
                    },
                  carouselFeedback.showing &&
                    carouselFeedback.isCorrect &&
                    (isPractice
                      ? { backgroundColor: visualTheme.continueButtonCorrectBg }
                      : styles.continueButtonCorrect),
                ]}
                onPress={() => {
                  if (showingDrillExplanation) {
                    handleExplanationContinue();
                  } else if (carouselSubmitRef.current) {
                    carouselSubmitRef.current();
                  }
                }}
              >
                <Text style={styles.continueButtonText}>
                  {showingDrillExplanation
                    ? "המשך"
                    : carouselFeedback.showing && carouselFeedback.isCorrect
                      ? "המשך"
                      : step.activityConfig.carousel.submitText || "אישור"}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      {/* Static button for dragMatch drill using the shared absolute pattern */}
      {(step.activity as any) === "dragMatch" &&
        step.activityConfig?.dragMatch &&
        !showSimpleQuestionButtonSheet &&
        !showCorrectOverlay &&
        choices &&
        choices.length === 1 && (
          <View style={styles.absoluteContinueButton}>
            <Pressable
              style={styles.continueButton}
              onPress={() => {
                if (showingDrillExplanation) {
                  // Continue to next step after explanation
                  handleExplanationContinue();
                } else if (dragMatchSubmitRef.current) {
                  // Trigger submit from dragMatch drill component
                  dragMatchSubmitRef.current();
                }
              }}
              disabled={!showingDrillExplanation && !dragMatchCanSubmit}
            >
              <Text style={styles.continueButtonText}>
                {showingDrillExplanation
                  ? "המשך"
                  : step.activityConfig.dragMatch.submitText || "אישור"}
              </Text>
            </Pressable>
          </View>
        )}

      {/* Static button for explanation drill */}
      {isExplanation &&
        step.activityConfig?.explanation &&
        !showSimpleQuestionButtonSheet &&
        !showCorrectOverlay &&
        choices &&
        choices.length === 1 && (
          <View style={styles.absoluteContinueButton}>
            <Pressable
              style={styles.continueButton}
              onPress={() => {
                if (step.choices && step.choices.length > 0) {
                  handleChoice(step.choices[0].nextStep);
                } else {
                  console.warn("ExplanationDrill: No next step defined");
                }
              }}
            >
              <Text style={styles.continueButtonText}>
                {step.activityConfig?.explanation?.buttonText || "המשך"}
              </Text>
            </Pressable>
          </View>
        )}

      {/* Static button for sequenceBuild drill using the shared absolute pattern */}
      {step.activity === "sequenceBuild" &&
        step.activityConfig?.sequenceBuild &&
        !showSimpleQuestionButtonSheet &&
        !showCorrectOverlay &&
        choices &&
        choices.length === 1 && (
          <View style={styles.absoluteContinueButton}>
            <Pressable
              style={styles.continueButton}
              onPress={() => {
                if (showingDrillExplanation) {
                  // Continue to next step after explanation
                  handleExplanationContinue();
                } else if (sequenceBuildSubmitRef.current) {
                  // Trigger submit from sequenceBuild drill component
                  sequenceBuildSubmitRef.current();
                }
              }}
              disabled={!showingDrillExplanation && !sequenceBuildCanSubmit}
            >
              <Text style={styles.continueButtonText}>
                {showingDrillExplanation
                  ? "המשך"
                  : step.activityConfig.sequenceBuild.submitText || "אישור"}
              </Text>
            </Pressable>
          </View>
        )}
      {/* Static button for questionWithImage */}
      {activityType === "questionWithImage" &&
        step.activityConfig?.questionWithImage &&
        !showSimpleQuestionButtonSheet &&
        !showCorrectOverlay &&
        choices &&
        choices.length === 1 &&
        (questionWithImageCanSubmit || showingDrillExplanation) && (
          <View style={styles.absoluteContinueButton}>
            <Pressable
              style={styles.continueButton}
              onPress={() => {
                if (showingDrillExplanation) {
                  // Continue to next step after explanation
                  handleExplanationContinue();
                } else if (
                  questionWithImageSubmitRef.current &&
                  questionWithImageCanSubmit
                ) {
                  // Trigger submit from questionWithImage drill component
                  questionWithImageSubmitRef.current();
                }
              }}
              disabled={!showingDrillExplanation && !questionWithImageCanSubmit}
            >
              <Text style={styles.continueButtonText}>
                {showingDrillExplanation
                  ? "המשך"
                  : step.activityConfig.questionWithImage.submitText || "בדוק"}
              </Text>
            </Pressable>
          </View>
        )}
      {/* Static button for questionWithSVG and graphQuestion using same absolute pattern */}
      {(activityType === "questionWithSVG" || isGraphQuestionActivity) &&
        (activityType === "questionWithSVG"
          ? step.activityConfig?.questionWithImage
          : activityType === "graphQuestion"
            ? (step.activityConfig as any)?.graphQuestion
            : (step.activityConfig as any)?.graphQuestionPNG) &&
        !showSimpleQuestionButtonSheet &&
        !showCorrectOverlay &&
        ((activityType === "questionWithSVG"
          ? questionSvgCanSubmit
          : graphQuestionCanSubmit) ||
          showingDrillExplanation ||
          graphQuestionViewingExplanation ||
          graphQuestionPNGViewingExplanation) && (
          <View style={styles.absoluteContinueButton}>
            <Pressable
              style={[
                styles.continueButton,
                isPractice && { backgroundColor: visualTheme.confirmButtonBg },
              ]}
              onPress={() => {
                if (showingDrillExplanation) {
                  handleExplanationContinue();
                } else if (graphQuestionPNGViewingExplanation) {
                  if (pendingGraphQuestionPNGResult) {
                    handleDrillComplete(pendingGraphQuestionPNGResult);
                  }
                } else if (graphQuestionViewingExplanation) {
                  // handleDrillComplete for non-PNG graph
                  const selectedChoice = (
                    (step.activityConfig as any).graphQuestion.choices || []
                  ).find((c: any) => c.id === graphQuestionSelectedChoiceId);
                  const isCorrect = selectedChoice?.correct || false;
                  const rewards = isCorrect
                    ? (step.activityConfig as any)?.graphQuestion?.rewards || 0
                    : 0;
                  const explanation = isCorrect
                    ? (step.activityConfig as any).graphQuestion
                        .correctExplanation || ""
                    : (step.activityConfig as any).graphQuestion
                        .wrongExplanation || "";

                  handleDrillComplete({
                    isCorrect,
                    correct: isCorrect,
                    explanation,
                    rewards,
                  });
                } else if (activityType === "questionWithSVG") {
                  if (questionSvgSubmitRef.current && questionSvgCanSubmit) {
                    questionSvgSubmitRef.current();
                  }
                } else if (
                  graphQuestionSubmitRef.current &&
                  graphQuestionCanSubmit
                ) {
                  graphQuestionSubmitRef.current();
                }
              }}
              disabled={
                !showingDrillExplanation &&
                !(activityType === "questionWithSVG"
                  ? questionSvgCanSubmit
                  : graphQuestionCanSubmit)
              }
            >
              <Text style={styles.continueButtonText}>
                {showingDrillExplanation ||
                graphQuestionViewingExplanation ||
                graphQuestionPNGViewingExplanation
                  ? "המשך"
                  : activityType === "questionWithSVG"
                    ? step.activityConfig?.questionWithImage?.submitText ||
                      "בדוק"
                    : activityType === "graphQuestion"
                      ? (step.activityConfig as any).graphQuestion.submitText ||
                        "בדוק"
                      : (step.activityConfig as any).graphQuestionPNG
                          .submitText || "בדוק"}
              </Text>
            </Pressable>
          </View>
        )}
      {/* Global button for pathSelect - after at least one question was explored */}
      {step.activity === "pathSelect" &&
        step.activityConfig?.pathSelect &&
        pathSelectViewingOption === null &&
        !showCorrectOverlay &&
        pathSelectCompletedOptions.size >= 1 && (
          <View style={styles.absoluteContinueButton}>
            <Pressable
              style={styles.continueButton}
              onPress={() => {
                if (choices && choices.length > 0 && choices[0].nextStep) {
                  handleChoice(choices[0].nextStep);
                }
              }}
            >
              <Text style={styles.continueButtonText}>
                {step.activityConfig.pathSelect.submitText || "המשך"}
              </Text>
            </Pressable>
          </View>
        )}
      {/* Global buttons for pathSelect explanation screens */}
      {step.activity === "pathSelect" &&
        pathSelectViewingOption !== null &&
        !showCorrectOverlay && (
          <View style={styles.pathSelectExplanationButtons}>
            {pathSelectCompletedOptions.size >= 1 && (
              <Pressable
                style={styles.pathSelectSkipButton}
                onPress={() => {
                  if (choices && choices.length > 0 && choices[0].nextStep) {
                    handleChoice(choices[0].nextStep);
                  }
                }}
              >
                <Text style={styles.pathSelectSkipButtonText}>
                  {step.activityConfig.pathSelect.submitText || "המשך לשלב הבא"}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[
                styles.continueButton,
                pathSelectCompletedOptions.size >= 1 &&
                  styles.pathSelectExplanationPrimaryButton,
              ]}
              onPress={() => {
                const selectedOption =
                  step.activityConfig?.pathSelect?.choices?.find(
                    (opt: any) => opt.id === pathSelectViewingOption,
                  );
                const baseScreen = selectedOption
                  ? {
                      explanation: selectedOption.explanation,
                      imageUrl: selectedOption.explanationImageUrl,
                      explanationImagePath: selectedOption.explanationImagePath,
                      svgCode: selectedOption.explanationSvgCode,
                      svgUrl: selectedOption.explanationSvgUrl,
                      svgPublicUrl: selectedOption.explanationSvgPublicUrl,
                      explanationSvgPath: selectedOption.explanationSvgPath,
                    }
                  : null;
                const extraScreens = selectedOption?.extraExplanations || [];
                const allScreens = [
                  ...(baseScreen ? [baseScreen] : []),
                  ...extraScreens,
                ];

                if (
                  allScreens.length > 0 &&
                  pathSelectViewingScreenIndex < allScreens.length - 1
                ) {
                  setPathSelectViewingScreenIndex((idx) => idx + 1);
                  return;
                }

                setPathSelectCompletedOptions((prev) => {
                  const newSet = new Set(prev);
                  newSet.add(pathSelectViewingOption);
                  return newSet;
                });
                setPathSelectViewingScreenIndex(0);
                setPathSelectViewingOption(null);
              }}
            >
              <Text style={styles.continueButtonText}>
                {pathSelectCompletedOptions.size >= 1
                  ? "חזרה לשאלות"
                  : "המשך"}
              </Text>
            </Pressable>
          </View>
        )}
      <View style={styles.progressContainer}>
        {/* <Text style={styles.progressText}>
          {`${currentLessonSteps.findIndex(s => s.id === stepId) + 1}/${currentLessonSteps.length}`}
        </Text> */}
        <View
          style={[
            styles.progressBarBg,
            { backgroundColor: visualTheme.progressTrack },
          ]}
        >
          <Animated.View
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              height: "100%",
              backgroundColor: visualTheme.progressFill,
              borderRadius: 8,
            }}
          />
        </View>
      </View>
      </LessonScreenBackground>
    </LessonThemeProvider>
  );
}

const styles = StyleSheet.create({
  practiceScreenBg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  choicesSimpleQuestionPractice: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 16,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 8,
    // backgroundColor: 'red'
  },
  speechBubbleContainer: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 100,
  },
  drillContentArea: {
    width: "100%",
    flex: 1,
  },
  drillContentInner: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  bubbleWrapper: {
    width: "100%",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  textWithImageWrapper: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  textWithImageWrapperNoText: {
    paddingHorizontal: 0,
  },
  textWithImageContainer: {
    width: "95%",
    maxWidth: 700,
    alignSelf: "center",
    flex: 1,
    minHeight: 120,
    maxHeight: "70%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: 12,
  },
  textWithImageImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  textWithImageFullScreen: {
    position: "absolute",
    display: "flex",
    top: 5,
    left: 5,
    right: 0,
    bottom: 120, // Space for button (70px position + ~50px button height)
    width: "100%",
    padding: 4,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textWithImageFullScreenImageWrapper: {
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  textWithImageFullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    alignSelf: "center",
  },
  choices: {
    width: "100%",
    alignItems: "center",
    maxWidth: 500,
    alignSelf: "center",
    justifyContent: "center",
  },
  choicesSimpleQuestion: {
    width: "100%",
    paddingTop: 2,
  },
  pathSelectDrillWrap: {
    width: "100%",
    paddingHorizontal: 12,
  },
  mediaDrillWrap: {
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  mediaDrillWrapSized: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: undefined,
  },
  mediaDrillWrapYesNo: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: undefined,
  },
  carouselDrillWrap: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  choiceCard: {
    width: "92%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignSelf: "center",
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 10,
    // elevation: 3,
    alignItems: "center",
  },
  choiceText: {
    color: "#0D2033",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  choiceCardSelected: {
    backgroundColor: "#3372D8",
    shadowColor: "#3F9FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  choiceTextSelected: {
    color: "#FFFFFF",
  },
  choiceCardCorrect: {
    backgroundColor: "#12B76A",
  },
  choiceTextCorrect: {
    color: "#FFFFFF",
  },
  choiceCardWrong: {
    backgroundColor: "#FF6B6B",
  },
  choiceTextWrong: {
    color: "#FFFFFF",
  },
  choiceCardDisabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.6,
  },
  choiceTextDisabled: {
    color: "#9CA3AF",
  },
  choiceButton: {
    maxWidth: "95%",
    width: 340,
    alignSelf: "center",
  },
  confirmButton: {
    marginTop: 370,
    backgroundColor: "#3F9FFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    position: "absolute",
  },
  simpleTextButton: {
    marginTop: 20,
    backgroundColor: "#3F9FFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#3F9FFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  explainContainer: {
    width: "92%",
    maxWidth: 500,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  explainTextContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 20,
    width: "94%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  explainText: {
    color: "#0D2033",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "right",
  },
  explainImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#0D2033",
    marginBottom: 16,
  },
  absoluteContinueButton: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  carouselActionRow: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  tryAgainButton: {
    backgroundColor: "#FFFFFF",
    minWidth: 200,
    borderRadius: 16.4,
    paddingVertical: 14,
    paddingHorizontal: 21,
    borderWidth: 2,
    borderColor: "#3372D8",
    marginBottom: 0,
  },
  tryAgainButtonText: {
    color: "#3372D8",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  pathSelectExplanationButtons: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    gap: 10,
    paddingHorizontal: 24,
  },
  pathSelectSkipButton: {
    backgroundColor: "#FFFFFF",
    minWidth: 200,
    borderRadius: 16.4,
    paddingVertical: 14,
    paddingHorizontal: 21,
    borderWidth: 2,
    borderColor: "#3372D8",
  },
  pathSelectSkipButtonText: {
    color: "#3372D8",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  pathSelectExplanationPrimaryButton: {
    marginBottom: 0,
  },
  continueButton: {
    backgroundColor: "#3372D8",
    minWidth: 200,
    borderRadius: 16.4,
    paddingVertical: 16,
    paddingHorizontal: 21,
    marginBottom: 20,
    shadowColor: "#3F9FFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonCorrect: {
    backgroundColor: "#12B76A",
    shadowColor: "#12B76A",
  },
  continueButtonWrong: {
    backgroundColor: "#D92D20",
    shadowColor: "#D92D20",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  progressContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
    width: "100%",
    maxWidth: 500,
  },
  candleSvgWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    padding: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e355e",
    marginBottom: 2,
    textAlign: "center",
  },
  progressBarBg: {
    width: 340,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 26,
    overflow: "hidden",
    alignSelf: "center",
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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 1,
  },
  correctSheet: {
    width: "100%",
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 14,
  },
  correctTitle: {
    color: "#12B76A",
    fontWeight: "800",
    fontSize: 28,
    marginBottom: 16,
  },
  rewardPill: {
    backgroundColor: "#EEF7EE",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardPillText: {
    color: "#0D2033",
    fontWeight: "700",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#3F9FFF",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },
  prevBubbleContainer: {
    transform: [{ scale: 0.98 }],
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1, // Ensure it's behind other elements
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingCharacterContainer: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCharacter: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  loadingSpinnerContainer: {
    marginBottom: 20,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3F9FFF",
    marginTop: 10,
  },
  buttonSheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 2,
  },
  buttonSheet: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  buttonSheetTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonSheetTitleCorrect: {
    color: "#12B76A",
  },
  buttonSheetTitleWrong: {
    color: "#FF6B6B",
  },
  buttonSheetRewardRow: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  buttonSheetRewardText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#12B76A",
  },
  buttonSheetButtonWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSheetContinueButton: {
    backgroundColor: "#12B76A",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: "100%",
    alignItems: "center",
  },
  buttonSheetContinueButtonWrong: {
    backgroundColor: "#D92D20",
  },
  buttonSheetContinueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});
