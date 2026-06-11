import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  useWindowDimensions,
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
import Svg, { Path } from "react-native-svg";
import TopBar from "../components/ui/TopBar";
//@ts-ignore
import TrophyImage from "../assets/nodes/Trophy.png";
//@ts-ignore
import MoneyIconSource from "../assets/money.svg";

import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

const API_URL = `${API_BASE_URL}/user/add-coins`;
const TOP_BAR_HEIGHT = 90;
const SCREEN_EDGE_PADDING = 20;

type Props = NativeStackScreenProps<RootStackParamList, "LessonComplete">;

type LayoutMetrics = {
  scale: number;
  sectionGap: number;
  trophySize: number;
  gradeLetterSize: number;
  ringSize: number;
  ringBorder: number;
  statValueSize: number;
  statPillPadV: number;
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
};

function useCompactLayout(): LayoutMetrics & { bottomInset: number } {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableHeight =
    height - TOP_BAR_HEIGHT - insets.bottom - SCREEN_EDGE_PADDING;
  const scale = Math.min(1, Math.max(0.78, availableHeight / 620));

  return {
    scale,
    bottomInset: insets.bottom,
    sectionGap: Math.round(5 * scale),
    trophySize: Math.round(72 * scale),
    gradeLetterSize: Math.round(36 * scale),
    ringSize: Math.round(64 * scale),
    ringBorder: Math.max(2, Math.round(3 * scale)),
    statValueSize: Math.round(17 * scale),
    statPillPadV: Math.round(7 * scale),
    rewardValueSize: Math.round(18 * scale),
    rewardPadV: Math.round(8 * scale),
    rewardIcon: Math.round(22 * scale),
    btnPadV: Math.round(11 * scale),
    btnFont: Math.round(15 * scale),
    titleSize: Math.round(22 * scale),
    subtitleSize: Math.round(14 * scale),
    summarySize: Math.round(12 * scale),
    badgeFont: Math.round(11 * scale),
    hintFont: Math.round(12 * scale),
    heroPadV: Math.round(10 * scale),
    cardPad: Math.round(10 * scale),
  };
}

function StatPill({
  label,
  value,
  accent,
  metrics,
}: {
  label: string;
  value: string;
  accent: string;
  metrics: LayoutMetrics;
}) {
  return (
    <View style={[styles.statPill, { paddingVertical: metrics.statPillPadV }]}>
      <Text
        style={[
          styles.statPillValue,
          { color: accent, fontSize: metrics.statValueSize },
        ]}
      >
        {value}
      </Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

function AccuracyRing({
  percent,
  color,
  metrics,
}: {
  percent: number | null;
  color: string;
  metrics: LayoutMetrics;
}) {
  const display = percent === null ? "—" : `${percent}%`;
  const ringFont = Math.round(16 * metrics.scale);
  return (
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
      ]}
    >
      <Text style={[styles.gradeRingPercent, { color, fontSize: ringFont }]}>
        {display}
      </Text>
      <Text style={styles.gradeRingSub}>דיוק</Text>
    </View>
  );
}

export default function LessonCompleteScreen({ navigation, route }: Props) {
  const layout = useCompactLayout();
  const { setCoins } = useUser();
  const { lessonsRegistry, loadingRegistry } = useLessons();
  const { openDictionary } = useDictionary();
  const [coinsLoading, setCoinsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigatingRef = useRef(false);

  const lessonId = route.params?.lessonId;
  const unitIdFromRoute = route.params?.unitId;
  const earnedCoins = route.params?.coinsEarned ?? 0;
  const correctCount = route.params?.correctCount ?? 0;
  const totalGraded = route.params?.totalGraded ?? 0;
  const durationMs = route.params?.durationMs ?? 0;
  const lightningsEarned = route.params?.lightningsEarned ?? 0;

  const accuracy = useMemo(
    () => computeAccuracyPercent(correctCount, totalGraded),
    [correctCount, totalGraded],
  );
  const grade = useMemo(() => gradeFromAccuracy(accuracy), [accuracy]);
  const timeSpent = useMemo(
    () => formatLessonDuration(durationMs),
    [durationMs],
  );

  const currentLesson = useMemo(() => {
    if (!lessonId || !lessonsRegistry.length) return null;
    return findLessonInRegistry(lessonsRegistry, lessonId)?.lesson ?? null;
  }, [lessonsRegistry, lessonId]);

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
    const addCoins = async () => {
      if (earnedCoins <= 0) return;
      setCoinsLoading(true);
      try {
        const res = await fetchWithTimeout(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coins: earnedCoins }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add coins");
        }
        const data = await res.json();
        setCoins(data.newCoins);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Network error";
        console.error("Error adding coins:", e);
        setError(message);
      } finally {
        setCoinsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      void addCoins();
    }, 100);
    return () => clearTimeout(timer);
  }, [earnedCoins, setCoins]);

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

  const stackGap = layout.sectionGap;

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={[styles.body, bodyPadding]}>
        <View style={[styles.contentStack, { gap: stackGap }]}>
        <View style={[styles.heroCard, { paddingVertical: layout.heroPadV }]}>
          <View style={styles.heroBadge}>
            <Text style={[styles.heroBadgeText, { fontSize: layout.badgeFont }]}>
              {grade.label}
            </Text>
          </View>
          <Image
            source={TrophyImage}
            style={{
              width: layout.trophySize,
              height: layout.trophySize,
              marginBottom: 4,
            }}
            resizeMode="contain"
          />
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>
            כל הכבוד!
          </Text>
          <Text
            style={[styles.subtitle, { fontSize: layout.subtitleSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            סיימת את {currentLesson?.title || "השיעור"}
          </Text>
          <Text
            style={[styles.summaryLine, { fontSize: layout.summarySize }]}
            numberOfLines={1}
          >
            {summaryLine}
          </Text>
        </View>

        <View style={[styles.resultsCard, { padding: layout.cardPad }]}>
          <View style={styles.gradeRow}>
            <View style={styles.gradeLetterBlock}>
              <Text
                style={[
                  styles.gradeLetter,
                  {
                    color: grade.color,
                    fontSize: layout.gradeLetterSize,
                    lineHeight: layout.gradeLetterSize + 4,
                  },
                ]}
              >
                {grade.letter}
              </Text>
              <Text style={styles.gradeLetterCaption}>ציון</Text>
            </View>
            <AccuracyRing
              percent={accuracy}
              color={grade.color}
              metrics={layout}
            />
          </View>

          <View style={styles.statsRow}>
            <StatPill
              label="זמן"
              value={timeSpent}
              accent={theme.colors.primary[500]}
              metrics={layout}
            />
            <StatPill
              label="שאלות"
              value={totalGraded > 0 ? String(totalGraded) : "—"}
              accent={theme.colors.neutral[700]}
              metrics={layout}
            />
          </View>
        </View>

        <View style={[styles.midSection, { gap: stackGap }]}>
          <View style={styles.rewardsRow}>
            <View
              style={[
                styles.rewardCard,
                styles.rewardCardCoins,
                { paddingVertical: layout.rewardPadV },
              ]}
            >
              <MoneyIconSource
                width={layout.rewardIcon}
                height={layout.rewardIcon}
              />
              <Text
                style={[
                  styles.rewardValue,
                  { fontSize: layout.rewardValueSize },
                ]}
              >
                +{earnedCoins}
              </Text>
              <Text style={styles.rewardLabel}>מטבעות</Text>
              {coinsLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.success[600]}
                  style={styles.rewardLoader}
                />
              ) : null}
            </View>
            {lightningsEarned > 0 ? (
              <View
                style={[
                  styles.rewardCard,
                  styles.rewardCardLightning,
                  { paddingVertical: layout.rewardPadV },
                ]}
              >
                <Svg
                  width={layout.rewardIcon}
                  height={layout.rewardIcon}
                  viewBox="0 0 28 27"
                  fill="none"
                >
                  <Path
                    d="M17.6562 1.99915L9.71582 3.07922L6.21582 15.0792L10.957 16.9991H19.6562L12.9043 24.3312L20.9043 12.3312L16.8203 9.99915H19.6562L17.6562 1.99915Z"
                    fill="#62D24C"
                    stroke="#368642"
                  />
                </Svg>
                <Text
                  style={[
                    styles.rewardValueLightning,
                    { fontSize: layout.rewardValueSize },
                  ]}
                >
                  +{lightningsEarned}
                </Text>
                <Text style={styles.rewardLabelLightning}>ברקים</Text>
              </View>
            ) : null}
          </View>

          <Pressable
            style={[styles.dictionaryHint, { paddingVertical: layout.statPillPadV }]}
            onPress={() => openDictionary()}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 2H5C3.89543 2 3 2.89543 3 4V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V4C21 2.89543 20.1046 2 19 2Z"
                fill={theme.colors.primary[400]}
              />
            </Svg>
            <Text
              style={[styles.dictionaryHintText, { fontSize: layout.hintFont }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              חזרה מהירה למושגים שלמדתם
            </Text>
          </Pressable>
        </View>
        </View>

        <View style={[styles.buttonsContainer, { gap: stackGap }]}>
          <Pressable
            style={[
              styles.continueButton,
              { paddingVertical: layout.btnPadV },
              !canNavigate && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canNavigate}
          >
            {!canNavigate ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[styles.continueButtonText, { fontSize: layout.btnFont }]}
              >
                {continueLabel}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.homeButton,
              { paddingVertical: layout.btnPadV },
              !canNavigate && styles.buttonDisabled,
            ]}
            onPress={handleHome}
            disabled={!canNavigate}
          >
            <Text style={[styles.homeButtonText, { fontSize: layout.btnFont }]}>
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
  heroCard: {
    width: "100%",
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexShrink: 1,
  },
  heroBadge: {
    backgroundColor: theme.colors.info[100],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    marginBottom: 4,
  },
  heroBadgeText: {
    fontFamily: theme.font.bold,
    color: theme.colors.primary[600],
  },
  title: {
    fontFamily: theme.font.bold,
    color: theme.colors.primary[600],
    textAlign: "center",
  },
  subtitle: {
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[900],
    textAlign: "center",
    marginTop: 2,
    paddingHorizontal: 4,
    width: "100%",
  },
  summaryLine: {
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "center",
    marginTop: 2,
  },
  resultsCard: {
    width: "100%",
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    gap: 6,
    flexShrink: 0,
  },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  gradeLetterBlock: {
    alignItems: "center",
  },
  gradeLetter: {
    fontFamily: theme.font.bold,
  },
  gradeLetterCaption: {
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
  gradeRingSub: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.neutral[100],
    alignItems: "center",
  },
  statPillValue: {
    fontFamily: theme.font.bold,
  },
  statPillLabel: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    marginTop: 1,
  },
  midSection: {
    width: "100%",
    flexShrink: 0,
  },
  rewardsRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    width: "100%",
  },
  rewardCard: {
    flex: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  rewardCardCoins: {
    backgroundColor: theme.colors.success[100],
    borderWidth: 1,
    borderColor: "rgba(18, 183, 106, 0.25)",
  },
  rewardCardLightning: {
    backgroundColor: "#E8F8E0",
    borderWidth: 1,
    borderColor: "rgba(54, 134, 66, 0.25)",
  },
  rewardValue: {
    fontFamily: theme.font.bold,
    color: theme.colors.success[600],
  },
  rewardValueLightning: {
    fontFamily: theme.font.bold,
    color: "#368642",
  },
  rewardLabel: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: theme.colors.success[600],
  },
  rewardLabelLightning: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: "#368642",
  },
  rewardLoader: {
    marginTop: 2,
  },
  dictionaryHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    width: "100%",
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  dictionaryHintText: {
    fontFamily: theme.font.family,
    color: theme.colors.primary[600],
    textAlign: "center",
    flex: 1,
  },
  buttonsContainer: {
    width: "100%",
    flexShrink: 0,
    paddingTop: 4,
  },
  continueButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.radius.md,
    alignItems: "center",
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
