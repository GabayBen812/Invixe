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
import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { formatMoney } from "../utils/money";

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
  theme.colors.primary[400],
  theme.colors.primary[500],
  theme.colors.success[600],
  theme.colors.warning[600],
  theme.colors.accent.purple500,
  "#FF6B6B",
  "#76D761",
];

const CONFETTI_ACTIVE_MS = 5200;

function ConfettiBurst({ active }: { active: boolean }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        x: ((i * 47 + 19) % Math.max(Math.floor(width), 1)) + (i % 3) * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + (i % 5),
        delay: (i % 12) * 70,
        drift: ((i % 7) - 3) * 28,
        spin: i % 2 === 0 ? 1 : -1,
        round: i % 4 === 0,
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
        duration: 3800 + (i % 6) * 220,
        delay: pieces[i].delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
    });
    Animated.stagger(40, runs).start();
  }, [active, anims, pieces]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {pieces.map((piece, i) => {
        const progress = anims[i];
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, height * 0.9],
        });
        const translateX = progress.interpolate({
          inputRange: [0, 0.45, 1],
          outputRange: [0, piece.drift * 0.55, piece.drift],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${piece.spin * 380}deg`],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.08, 0.55, 0.85, 1],
          outputRange: [0, 1, 1, 0.7, 0],
        });
        return (
          <Animated.View
            key={piece.id}
            style={{
              position: "absolute",
              top: 12,
              left: piece.x,
              width: piece.size,
              height: piece.round ? piece.size : piece.size * 1.85,
              borderRadius: piece.round ? piece.size / 2 : 2,
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
    sectionGap: Math.round(12 * scale),
    trophySize: Math.round(84 * scale),
    gradeBox: Math.round(50 * scale),
    gradeLetterSize: Math.round(26 * scale),
    ringSize: Math.round(56 * scale),
    ringBorder: Math.max(3, Math.round(4 * scale)),
    statValueSize: Math.round(20 * scale),
    rewardValueSize: Math.round(24 * scale),
    rewardPadV: Math.round(12 * scale),
    rewardIcon: Math.round(24 * scale),
    btnPadV: Math.round(13 * scale),
    btnFont: Math.round(16 * scale),
    titleSize: Math.round(26 * scale),
    subtitleSize: Math.round(15 * scale),
    summarySize: Math.round(13 * scale),
    badgeFont: Math.round(12 * scale),
    hintFont: Math.round(13 * scale),
    heroPadV: Math.round(16 * scale),
    cardPad: Math.round(12 * scale),
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
  const { addCash } = useUser();
  const { lessonsRegistry, loadingRegistry } = useLessons();
  const { openDictionary } = useDictionary();
  const [cashLoading, setCashLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(true);
  const navigatingRef = useRef(false);
  const cashGrantedRef = useRef(false);

  const lessonId = route.params?.lessonId;
  const unitIdFromRoute = route.params?.unitId;
  const earnedCash = route.params?.cashEarned ?? 0;
  const alreadyAwardedCash = route.params?.alreadyAwardedCash ?? 0;
  const remainingCash = Math.max(0, earnedCash - alreadyAwardedCash);
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
    const grantRemainingCash = async () => {
      if (cashGrantedRef.current) return;
      if (remainingCash <= 0) return;
      cashGrantedRef.current = true;
      setCashLoading(true);
      try {
        await addCash(remainingCash);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Network error";
        console.error("Error adding cash:", e);
        setError(message);
        cashGrantedRef.current = false;
      } finally {
        setCashLoading(false);
      }
    };

    const timer = setTimeout(() => {
      void grantRemainingCash();
    }, 250);
    return () => clearTimeout(timer);
  }, [remainingCash, addCash]);

  useEffect(() => {
    const hide = setTimeout(() => setShowConfetti(false), CONFETTI_ACTIVE_MS);
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
                marginBottom: 6,
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
              סיימת את שיעור {currentLesson?.title || "השיעור"}
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
                      : {
                          backgroundColor: theme.colors.info[100],
                        }
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
              <View style={styles.rewardIconWrap}>
                <MoneyIconSource
                  width={layout.rewardIcon}
                  height={layout.rewardIcon}
                />
              </View>
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
                {
                  fontSize: layout.hintFont,
                  color: isPractice ? bodyText : theme.colors.primary[600],
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              חזרה מהירה למושגים שלמדתם
            </Text>
          </Pressable>
        </View>

        <View style={[styles.buttonsContainer, { gap: Math.round(8 * layout.scale) }]}>
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

      {/* Above all content so pieces aren't clipped by opaque cards */}
      <ConfettiBurst active={showConfetti} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.bg,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
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
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
    flexShrink: 1,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    marginBottom: 4,
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
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    paddingHorizontal: 4,
    flexShrink: 0,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 160,
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
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  rewardCardLight: {
    backgroundColor: theme.colors.success[100],
    borderColor: "rgba(18, 183, 106, 0.28)",
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
  rewardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(18, 183, 106, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardCopy: {
    alignItems: "flex-start",
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
    borderRadius: theme.radius.md,
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
    paddingTop: 6,
  },
  continueButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.radius.md,
    alignItems: "center",
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontFamily: theme.font.bold,
  },
  homeButton: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary[400],
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
