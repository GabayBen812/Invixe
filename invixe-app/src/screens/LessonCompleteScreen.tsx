import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CommonActions,
  NativeStackScreenProps,
} from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import theme from "../theme";
import { useUser } from "../context/UserContext";
import { useLessons } from "../context/LessonsContext";
import { useDictionary } from "../context/DictionaryContext";
import {
  findLessonInRegistry,
  getNextLessonFromRegistry,
  getStepIndexForLessonInRegistry,
} from "../modules/lessons/lessonNavigation";
import {
  computeAccuracyPercent,
  formatLessonDuration,
  gradeFromAccuracy,
} from "../utils/lessonResults";
import { getThemeForLesson } from "../modules/lessons/lessonTheme";
import DictionaryBookIcon from "../components/ui/DictionaryBookIcon";
//@ts-ignore
import TrophyImage from "../assets/nodes/Trophy.png";
//@ts-ignore
import MoneyIconSource from "../assets/money.svg";
import TopBar from "../components/ui/TopBar";
import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { formatMoney } from "../utils/money";

const API_URL = `${API_BASE_URL}/user/add-coins`;
const TOP_BAR_HEIGHT = 90;
const SCREEN_EDGE_PADDING = 20;

type Props = NativeStackScreenProps<RootStackParamList, "LessonComplete">;

type LayoutMetrics = {
  scale: number;
  sectionGap: number;
  trophySize: number;
  gradeBox: number;
  gradeLetterSize: number;
  ringSize: number;
  ringBorder: number;
  statValueSize: number;
  rewardValueSize: number;
  rewardPadV: number;
  rewardIcon: number;
  btnPadV: number;
  btnFont: number;
  titleSize: number;
  subtitleSize: number;
  summarySize: number;
  badgeFont: number;
  hintFont: number;
  heroPadV: number;
  cardPad: number;
  retryPadV: number;
};

const CONFETTI_COLORS = [
  "#3F9FFF",
  "#12B76A",
  "#F79009",
  "#850AFF",
  "#FF6B6B",
  "#76D761",
];

function ConfettiBurst({ active }: { active: boolean }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: (i * 37 + 13) % Math.max(width, 1),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 5 + (i % 4),
        delay: (i % 8) * 45,
        drift: ((i % 5) - 2) * 18,
        spin: i % 2 === 0 ? 1 : -1,
      })),
    [width],
  );

  const anims = useRef(pieces.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) return;
    const runs = anims.map((anim, i) => {
      anim.setValue(0);
      return Animated.timing(anim, {
        toValue: 1,
        duration: 1800 + (i % 5) * 120,
        delay: pieces[i].delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    });
    Animated.stagger(28, runs).start();
  }, [active, anims, pieces]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece, i) => {
        const progress = anims[i];
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-24, height * 0.72],
        });
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, piece.drift],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${piece.spin * 220}deg`],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.15, 0.75, 1],
          outputRange: [0, 1, 0.85, 0],
        });
        return (
          <Animated.View
            key={piece.id}
            style={{
              position: "absolute",
              top: 8,
              left: piece.x,
              width: piece.size,
              height: piece.size * 1.7,
              borderRadius: 2,
              backgroundColor: piece.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}

function useCompactLayout(): LayoutMetrics & { bottomInset: number } {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableHeight =
    height - TOP_BAR_HEIGHT - insets.bottom - SCREEN_EDGE_PADDING;
  const scale = Math.min(1, Math.max(0.78, availableHeight / 680));

  return {
    scale,
    bottomInset: insets.bottom,
    sectionGap: Math.round(10 * scale),
    trophySize: Math.round(88 * scale),
    gradeBox: Math.round(52 * scale),
    gradeLetterSize: Math.round(28 * scale),
    ringSize: Math.round(58 * scale),
    ringBorder: Math.max(3, Math.round(4 * scale)),
    statValueSize: Math.round(20 * scale),
    rewardValueSize: Math.round(26 * scale),
    rewardPadV: Math.round(14 * scale),
    rewardIcon: Math.round(28 * scale),
    btnPadV: Math.round(14 * scale),
    btnFont: Math.round(16 * scale),
    titleSize: Math.round(28 * scale),
    subtitleSize: Math.round(15 * scale),
    summarySize: Math.round(13 * scale),
    badgeFont: Math.round(12 * scale),
    hintFont: Math.round(13 * scale),
    heroPadV: Math.round(18 * scale),
    cardPad: Math.round(14 * scale),
    retryPadV: Math.round(8 * scale),
  };
}

function AccuracyRing({
  percent,
  color,
  metrics,
  ringStyle,
  labelColor,
}: {
  percent: number | null;
  color: string;
  metrics: LayoutMetrics;
  ringStyle?: object;
  labelColor?: string;
}) {
  const display = percent === null ? "—" : `${percent}%`;
  const ringFont = Math.round(15 * metrics.scale);
  return (
    <View style={styles.statCell}>
      <View
        style={[
          styles.gradeRingInner,
          {
            width: metrics.ringSize,
            height: metrics.ringSize,
            borderRadius: metrics.ringSize / 2,
            borderWidth: metrics.ringBorder,
            borderColor: color,
          },
          ringStyle,
        ]}
      >
        <Text style={[styles.gradeRingPercent, { color, fontSize: ringFont }]}>
          {display}
        </Text>
      </View>
      <Text
        style={[
          styles.statCaption,
          labelColor ? { color: labelColor } : null,
        ]}
      >
        דיוק
      </Text>
    </View>
  );
}

function StatCell({
  label,
  value,
  accent,
  labelColor,
  valueSize,
}: {
  label: string;
  value: string;
  accent: string;
  labelColor?: string;
  valueSize: number;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statCellValue, { color: accent, fontSize: valueSize }]}>
        {value}
      </Text>
      <Text
        style={[
          styles.statCaption,
          labelColor ? { color: labelColor } : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function LessonCompleteScreen({ navigation, route }: Props) {
  const layout = useCompactLayout();
  const { setCash, currentUserEmail } = useUser();
  const { lessonsRegistry, loadingRegistry } = useLessons();
  const { openDictionary } = useDictionary();
  const [cashLoading, setCashLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(true);
  const navigatingRef = useRef(false);

  const lessonId = route.params?.lessonId;
  const unitIdFromRoute = route.params?.unitId;
  const earnedCash = route.params?.cashEarned ?? 0;
  const correctCount = route.params?.correctCount ?? 0;
  const totalGraded = route.params?.totalGraded ?? 0;
  const durationMs = route.params?.durationMs ?? 0;

  const accuracy = useMemo(
    () => computeAccuracyPercent(correctCount, totalGraded),
    [correctCount, totalGraded],
  );
  const grade = useMemo(() => gradeFromAccuracy(accuracy), [accuracy]);
  const timeSpent = useMemo(
    () => formatLessonDuration(durationMs),
    [durationMs],
  );
  const showRetry = accuracy !== null && accuracy < 75;

  const currentLesson = useMemo(() => {
    if (!lessonId || !lessonsRegistry.length) return null;
    return findLessonInRegistry(lessonsRegistry, lessonId)?.lesson ?? null;
  }, [lessonsRegistry, lessonId]);

  const visualTheme = useMemo(
    () => getThemeForLesson(currentLesson),
    [currentLesson],
  );
  const isPractice = visualTheme.variant === "practice";

  const nextLesson = useMemo(() => {
    if (!lessonId || !lessonsRegistry.length) return null;
    return getNextLessonFromRegistry(lessonsRegistry, lessonId);
  }, [lessonsRegistry, lessonId]);

  const mapUnitIndex = useMemo(() => {
    if (!lessonId || !lessonsRegistry.length) return undefined;
    const idx = getStepIndexForLessonInRegistry(lessonsRegistry, lessonId);
    return idx !== null ? idx : undefined;
  }, [lessonsRegistry, lessonId]);

  useEffect(() => {
    const addCash = async () => {
      if (earnedCash <= 0 || !currentUserEmail) return;
      setCashLoading(true);
      try {
        const res = await fetchWithTimeout(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUserEmail, coins: earnedCash }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add cash");
        }
        const data = await res.json();
        setCash(data.newCoins);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Network error";
        console.error("Error adding cash:", e);
        setError(message);
      } finally {
        setCashLoading(false);
      }
    };

    const timer = setTimeout(() => {
      void addCash();
    }, 100);
    return () => clearTimeout(timer);
  }, [earnedCash, setCash, currentUserEmail]);

  useEffect(() => {
    const hide = setTimeout(() => setShowConfetti(false), 2600);
    return () => clearTimeout(hide);
  }, []);

  const resetToMap = useCallback(
    (selectedUnitIdx?: number) => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "Map",
              params:
                selectedUnitIdx !== undefined
                  ? { selectedUnitIdx }
                  : undefined,
            },
          ],
        }),
      );
    },
    [navigation],
  );

  const resetToLesson = useCallback(
    (
      targetLessonId: number,
      targetUnitId?: string,
      selectedUnitIdx?: number,
    ) => {
      const mapParams =
        selectedUnitIdx !== undefined ? { selectedUnitIdx } : undefined;
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: "Map", params: mapParams },
            {
              name: "Lesson",
              params: { lessonId: targetLessonId, unitId: targetUnitId },
            },
          ],
        }),
      );
    },
    [navigation],
  );

  const handleContinue = useCallback(() => {
    if (navigatingRef.current) return;
    if (!lessonId) {
      resetToMap();
      return;
    }
    if (loadingRegistry && !lessonsRegistry.length) return;

    navigatingRef.current = true;
    const next =
      nextLesson ??
      (lessonsRegistry.length
        ? getNextLessonFromRegistry(lessonsRegistry, lessonId)
        : null);

    if (next) {
      resetToLesson(next.lessonId, next.unitId ?? unitIdFromRoute, next.stepIndex);
      return;
    }
    resetToMap(mapUnitIndex);
  }, [
    lessonId,
    loadingRegistry,
    lessonsRegistry,
    nextLesson,
    resetToLesson,
    resetToMap,
    mapUnitIndex,
    unitIdFromRoute,
  ]);

  const handleHome = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    resetToMap(mapUnitIndex);
  }, [resetToMap, mapUnitIndex]);

  const handleRetry = useCallback(() => {
    if (navigatingRef.current || !lessonId) return;
    navigatingRef.current = true;
    resetToLesson(lessonId, unitIdFromRoute, mapUnitIndex);
  }, [lessonId, unitIdFromRoute, mapUnitIndex, resetToLesson]);

  const canNavigate = !loadingRegistry || lessonsRegistry.length > 0;
  const hasNextLesson = !!nextLesson;
  const continueLabel = hasNextLesson ? "המשך ללמוד" : "חזרה למפה";

  const summaryLine =
    totalGraded > 0
      ? `${correctCount} מתוך ${totalGraded} תשובות נכונות`
      : "סיימת את כל שלבי השיעור";

  const bodyPadding = useMemo(
    () => ({
      paddingHorizontal: SCREEN_EDGE_PADDING,
      paddingBottom: Math.max(layout.bottomInset, 10) + 6,
    }),
    [layout.bottomInset],
  );

  const mutedText = isPractice
    ? visualTheme.choiceDisabledText
    : theme.colors.neutral[500];
  const cardStyle = isPractice
    ? {
        backgroundColor: visualTheme.contentPanelBg,
        borderColor: visualTheme.mediaSurfaceBorder,
        shadowOpacity: 0,
        elevation: 0,
      }
    : null;
  const dividerColor = isPractice
    ? "rgba(255,255,255,0.1)"
    : theme.colors.border.subtle;
  const primaryAccent = isPractice
    ? visualTheme.progressFill
    : theme.colors.primary[500];
  const titleColor = isPractice
    ? visualTheme.progressFill
    : theme.colors.primary[600];
  const bodyText = isPractice
    ? visualTheme.instructionText
    : theme.colors.neutral[900];

  return (
    <View
      style={[
        styles.container,
        isPractice && { backgroundColor: visualTheme.screenBg },
      ]}
    >
      <TopBar />
      <ConfettiBurst active={showConfetti} />
      <View style={[styles.body, bodyPadding]}>
        <View style={[styles.contentStack, { gap: layout.sectionGap }]}>
          {showRetry ? (
            <Pressable
              style={[
                styles.retryChip,
                { paddingVertical: layout.retryPadV },
                isPractice
                  ? {
                      backgroundColor: "rgba(118, 215, 97, 0.14)",
                      borderColor: visualTheme.mediaSurfaceBorder,
                    }
                  : null,
              ]}
              onPress={handleRetry}
              disabled={!canNavigate}
            >
              <Text
                style={[
                  styles.retryChipText,
                  { fontSize: layout.hintFont },
                  isPractice && { color: visualTheme.progressFill },
                ]}
              >
                ↻  נסה שוב
              </Text>
            </Pressable>
          ) : null}

          <View
            style={[
              styles.heroCard,
              { paddingVertical: layout.heroPadV },
              cardStyle,
            ]}
          >
            <View
              style={[
                styles.heroBadge,
                { backgroundColor: `${grade.color}22` },
              ]}
            >
              <Text
                style={[
                  styles.heroBadgeText,
                  { fontSize: layout.badgeFont, color: grade.color },
                ]}
              >
                {grade.label}
              </Text>
            </View>

            <Image
              source={TrophyImage}
              style={{
                width: layout.trophySize,
                height: layout.trophySize,
                marginBottom: 8,
              }}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.title,
                { fontSize: layout.titleSize, color: titleColor },
              ]}
            >
              כל הכבוד!
            </Text>
            <Text
              style={[
                styles.subtitle,
                { fontSize: layout.subtitleSize, color: bodyText },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              סיימת את {currentLesson?.title || "השיעור"}
            </Text>
            <Text
              style={[
                styles.summaryLine,
                { fontSize: layout.summarySize, color: mutedText },
              ]}
              numberOfLines={1}
            >
              {summaryLine}
            </Text>
          </View>

          <View
            style={[
              styles.resultsCard,
              { paddingVertical: layout.cardPad },
              cardStyle,
            ]}
          >
            <View style={styles.statsGrid}>
              <View style={[styles.statsCol, styles.statsColLeft]}>
                <View style={styles.statCell}>
                  <View
                    style={[
                      styles.gradeBox,
                      {
                        width: layout.gradeBox,
                        height: layout.gradeBox,
                        borderRadius: Math.round(layout.gradeBox * 0.28),
                        backgroundColor: `${grade.color}18`,
                        borderColor: `${grade.color}55`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gradeLetter,
                        {
                          color: grade.color,
                          fontSize: layout.gradeLetterSize,
                        },
                      ]}
                    >
                      {grade.letter}
                    </Text>
                  </View>
                  <Text style={[styles.statCaption, { color: mutedText }]}>
                    ציון
                  </Text>
                </View>

                <View
                  style={[styles.gridHRule, { backgroundColor: dividerColor }]}
                />

                <StatCell
                  label="זמן"
                  value={timeSpent}
                  accent={primaryAccent}
                  labelColor={mutedText}
                  valueSize={layout.statValueSize}
                />
              </View>

              <View
                style={[styles.gridVRule, { backgroundColor: dividerColor }]}
              />

              <View style={[styles.statsCol, styles.statsColRight]}>
                <AccuracyRing
                  percent={accuracy}
                  color={grade.color}
                  metrics={layout}
                  ringStyle={
                    isPractice
                      ? { backgroundColor: visualTheme.mediaSurfaceBg }
                      : undefined
                  }
                  labelColor={mutedText}
                />

                <View
                  style={[styles.gridHRule, { backgroundColor: dividerColor }]}
                />

                <StatCell
                  label="שאלות"
                  value={totalGraded > 0 ? String(totalGraded) : "—"}
                  accent={bodyText}
                  labelColor={mutedText}
                  valueSize={layout.statValueSize}
                />
              </View>
            </View>
          </View>

          <View
            style={[
              styles.rewardCard,
              { paddingVertical: layout.rewardPadV },
              isPractice
                ? styles.rewardCardPractice
                : styles.rewardCardLight,
            ]}
          >
            <View style={styles.rewardInner}>
              <MoneyIconSource
                width={layout.rewardIcon}
                height={layout.rewardIcon}
              />
              <View style={styles.rewardCopy}>
                <Text
                  style={[
                    styles.rewardValue,
                    { fontSize: layout.rewardValueSize },
                  ]}
                >
                  +{formatMoney(earnedCash)}
                </Text>
                <Text style={styles.rewardLabel}>מזומן</Text>
              </View>
              {cashLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.success[600]}
                />
              ) : null}
            </View>
          </View>

          <Pressable
            style={[
              styles.dictionaryHint,
              { paddingVertical: Math.round(12 * layout.scale) },
              cardStyle,
            ]}
            onPress={() => openDictionary()}
          >
            <DictionaryBookIcon size={18} color={primaryAccent} />
            <Text
              style={[
                styles.dictionaryHintText,
                { fontSize: layout.hintFont, color: bodyText },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              חזרה מהירה למושגים שלמדתם
            </Text>
          </Pressable>
        </View>

        <View style={[styles.buttonsContainer, { gap: layout.sectionGap }]}>
          <Pressable
            style={[
              styles.continueButton,
              { paddingVertical: layout.btnPadV },
              isPractice && {
                backgroundColor: visualTheme.confirmButtonBg,
                shadowColor: visualTheme.confirmButtonBg,
              },
              !canNavigate && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canNavigate}
          >
            {!canNavigate ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.continueButtonText,
                  { fontSize: layout.btnFont },
                ]}
              >
                {continueLabel}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.homeButton,
              { paddingVertical: layout.btnPadV },
              isPractice && {
                backgroundColor: "transparent",
                borderColor: visualTheme.progressFill,
              },
              !canNavigate && styles.buttonDisabled,
            ]}
            onPress={handleHome}
            disabled={!canNavigate}
          >
            <Text
              style={[
                styles.homeButtonText,
                { fontSize: layout.btnFont },
                isPractice && { color: visualTheme.progressFill },
              ]}
            >
              חזרה לבית
            </Text>
          </Pressable>

          {error ? (
            <Text style={styles.errorText} numberOfLines={1}>
              {error}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.bg,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  contentStack: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  retryChip: {
    alignSelf: "center",
    backgroundColor: theme.colors.info[100],
    borderRadius: theme.radius.pill,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(63, 159, 255, 0.35)",
  },
  retryChipText: {
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
    textAlign: "center",
  },
  heroCard: {
    width: "100%",
    backgroundColor: theme.colors.surface.card,
    borderRadius: 22,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    flexShrink: 1,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    marginBottom: 6,
  },
  heroBadgeText: {
    fontFamily: theme.font.bold,
  },
  title: {
    fontFamily: theme.font.bold,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: theme.font.bold,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 4,
    width: "100%",
  },
  summaryLine: {
    fontFamily: theme.font.family,
    textAlign: "center",
    marginTop: 4,
  },
  resultsCard: {
    width: "100%",
    backgroundColor: theme.colors.surface.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    paddingHorizontal: 4,
    flexShrink: 0,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 168,
  },
  statsCol: {
    flex: 1,
    justifyContent: "space-evenly",
  },
  statsColLeft: {
    paddingRight: 4,
  },
  statsColRight: {
    paddingLeft: 4,
  },
  gridVRule: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
  },
  gridHRule: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 18,
  },
  statCell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  gradeBox: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  gradeLetter: {
    fontFamily: theme.font.bold,
  },
  statCellValue: {
    fontFamily: theme.font.bold,
  },
  statCaption: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "center",
  },
  gradeRingInner: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.neutral[100],
  },
  gradeRingPercent: {
    fontFamily: theme.font.bold,
  },
  rewardCard: {
    width: "100%",
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  rewardCardLight: {
    backgroundColor: theme.colors.success[100],
    borderColor: "rgba(18, 183, 106, 0.3)",
  },
  rewardCardPractice: {
    backgroundColor: "rgba(18, 183, 106, 0.14)",
    borderColor: "rgba(118, 215, 97, 0.4)",
  },
  rewardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  rewardCopy: {
    alignItems: "center",
  },
  rewardValue: {
    fontFamily: theme.font.bold,
    color: theme.colors.success[600],
  },
  rewardLabel: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.success[600],
    marginTop: 1,
  },
  dictionaryHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    width: "100%",
    backgroundColor: theme.colors.surface.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  dictionaryHintText: {
    fontFamily: theme.font.family,
    textAlign: "center",
    flex: 1,
  },
  buttonsContainer: {
    width: "100%",
    flexShrink: 0,
    paddingTop: 8,
  },
  continueButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 16,
    alignItems: "center",
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontFamily: theme.font.bold,
  },
  homeButton: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  homeButtonText: {
    color: theme.colors.primary[500],
    fontFamily: theme.font.bold,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  errorText: {
    color: theme.colors.error[600],
    textAlign: "center",
    fontFamily: theme.font.family,
    fontSize: 11,
  },
});
