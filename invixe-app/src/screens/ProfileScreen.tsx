import { useMemo, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import PortfolioSparkline from "../components/profile/PortfolioSparkline";
import ProfileStatTile from "../components/profile/ProfileStatTile";
import ProfileStreakCard from "../components/profile/ProfileStreakCard";
import theme from "../theme";
import { useUser } from "../context/UserContext";
import { useDictionary } from "../context/DictionaryContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useLessons } from "../context/LessonsContext";
import Svg, { Path } from "react-native-svg";
import {
  DICTIONARY_ENTRIES,
  isEntryUnlocked,
} from "../data/dictionary";
import {
  countUnitsInProgress,
  findFirstIncompleteLesson,
} from "../modules/lessons/lessonNavigation";
import {
  formatPercent,
  formatUsd,
  type NormalizedHolding,
} from "../utils/portfolioNormalize";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const ICON_STROKE = "#475569";

function getInvestorBadge(completedLessonsCount: number): string {
  if (completedLessonsCount >= 30) return "משקיע מנוסה 🏆";
  if (completedLessonsCount >= 10) return "משקיע מתקדם 📈";
  return "משקיע מתחיל 🥇";
}

const StatBookIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      stroke={ICON_STROKE}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      stroke={ICON_STROKE}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

const StatDocIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke={ICON_STROKE}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
      stroke={ICON_STROKE}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const StatCapIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 10v6M2 10l10-5 10 5-10 5z"
      stroke={ICON_STROKE}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"
      stroke={ICON_STROKE}
      strokeWidth={1.8}
    />
  </Svg>
);

const StatXpIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 17l6-6 4 4 8-10"
      stroke={ICON_STROKE}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 5h7v7"
      stroke={ICON_STROKE}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

function estimateLessonDuration(stepIndex: number): string {
  const minutes = stepIndex % 3 === 0 ? 3 : stepIndex % 3 === 1 ? 4 : 5;
  return `${minutes} דק׳`;
}

export default function ProfileScreen({ navigation }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const {
    coins,
    completedLessons,
    lessonAttempts,
    logout,
    currentUserEmail,
    firstName,
    lastName,
  } = useUser();
  const { openDictionary, unlockMap } = useDictionary();
  const { lessonsRegistry } = useLessons();
  const {
    holdings: portfolio,
    loading,
    refreshPortfolio,
    portfolioStats,
    getHoldingChangePercent,
    portfolioHistory,
  } = usePortfolio();

  useFocusEffect(
    useCallback(() => {
      void refreshPortfolio();
    }, [refreshPortfolio]),
  );

  const sortedHoldings = useMemo(() => {
    return [...portfolio]
      .map((h) => ({
        ...h,
        changePercent: getHoldingChangePercent(h),
      }))
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }, [portfolio, getHoldingChangePercent]);

  const streakDays = useMemo(() => {
    if (!lessonAttempts?.length) return 0;
    const today = new Date();
    let streak = 0;
    for (let offset = 0; offset < 365; offset++) {
      const day = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - offset,
      );
      const dayStr = day.toDateString();
      const hasAttempt = lessonAttempts.some(
        (a) => new Date(a.lastAttempted).toDateString() === dayStr,
      );
      if (!hasAttempt) {
        if (offset === 0) return 0;
        break;
      }
      streak += 1;
    }
    return streak;
  }, [lessonAttempts]);

  const unlockedTermsCount = DICTIONARY_ENTRIES.filter((entry) =>
    isEntryUnlocked(entry, completedLessons, unlockMap),
  ).length;

  const coursesInProgress = countUnitsInProgress(
    lessonsRegistry,
    completedLessons,
  );

  const nextLesson = findFirstIncompleteLesson(
    lessonsRegistry,
    completedLessons,
  );

  const resolvedFirstName =
    firstName?.trim() ||
    (currentUserEmail ? currentUserEmail.split("@")[0] : "לומד");
  const resolvedLastName = lastName?.trim() || "";
  const userName = resolvedLastName
    ? `${resolvedFirstName} ${resolvedLastName}`
    : resolvedFirstName;

  const userInitials = (() => {
    const first = resolvedFirstName.charAt(0);
    const last = resolvedLastName.charAt(0);
    return (first + last).trim() || resolvedFirstName.slice(0, 2).toUpperCase();
  })();

  const sparklineWidth = Math.min(screenWidth - 80, 320);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollViewportHeightRef = useRef(400);
  const holdingsSectionYRef = useRef(0);
  const holdingsSectionHeightRef = useRef(0);

  const scrollToHoldings = useCallback(() => {
    const viewportH = scrollViewportHeightRef.current;
    const sectionCenter =
      holdingsSectionYRef.current + holdingsSectionHeightRef.current / 2;
    const targetY = Math.max(0, sectionCenter - viewportH / 2);
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
  }, []);

  const handleScrollToHoldings = useCallback(() => {
    requestAnimationFrame(() => {
      scrollToHoldings();
    });
  }, [scrollToHoldings]);

  const handleTabPress = (tab: "map" | "profile" | "graph") => {
    switch (tab) {
      case "map":
        navigation.navigate("Map", {});
        break;
      case "graph":
        navigation.navigate("Sandbox");
        break;
      case "profile":
        break;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  const openTrading = (symbol?: string) =>
    navigation.navigate("Sandbox", symbol ? { symbol } : undefined);

  const continueLearning = () => {
    if (nextLesson) {
      navigation.navigate("Lesson", {
        lessonId: nextLesson.lessonId,
        unitId: nextLesson.unitId,
      });
      return;
    }
    navigation.navigate("Map", {});
  };

  const renderChangeLabel = (changePercent: number) => {
    const isPositive = changePercent > 0.05;
    const isNegative = changePercent < -0.05;
    const color = isPositive
      ? theme.colors.growthGreen
      : isNegative
        ? theme.colors.error[600]
        : "#94A3B8";
    const arrow = isPositive ? "↑" : isNegative ? "↓" : "—";
    return (
      <Text style={[styles.holdingChange, { color }]}>
        {formatPercent(changePercent)} {arrow}
      </Text>
    );
  };

  const renderHoldingRow = (
    holding: NormalizedHolding & { changePercent: number },
  ) => (
    <Pressable
      key={holding.id}
      style={styles.holdingRow}
      onPress={() => openTrading(holding.symbol)}
    >
      <View style={styles.holdingAvatar}>
        <Text style={styles.holdingAvatarText}>
          {holding.symbol.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.holdingMeta}>
        <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
        <Text style={styles.holdingShares}>{holding.shares} מניות</Text>
      </View>
      {renderChangeLabel(holding.changePercent)}
      <Text style={styles.holdingChevron}>›</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => {
          scrollViewportHeightRef.current = e.nativeEvent.layout.height;
        }}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <View style={styles.profileTextCol}>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.profileMetaRow}>
              <Text style={styles.badgeText}>
                {getInvestorBadge(completedLessons.length)}
              </Text>
              <Text style={styles.xpText}>
                {coins.toLocaleString("he-IL")} XP
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.portfolioCard}>
          <Text style={styles.sectionTitle}>התיק שלי</Text>
          {loading ? (
            <ActivityIndicator
              color={theme.colors.primary[500]}
              style={{ marginVertical: 24 }}
            />
          ) : (
            <>
              <Text style={styles.portfolioValue}>
                {formatUsd(portfolioStats.totalValue)}
              </Text>
              <View style={styles.gainRow}>
                <Text style={styles.gainLabel}>סה״כ</Text>
                <View
                  style={[
                    styles.gainPill,
                    portfolioStats.gainPercent < -0.05 &&
                      styles.gainPillNegative,
                  ]}
                >
                  <Text
                    style={[
                      styles.gainPillText,
                      portfolioStats.gainPercent < -0.05 &&
                        styles.gainPillTextNegative,
                    ]}
                  >
                    {formatPercent(portfolioStats.gainPercent)}{" "}
                    {portfolioStats.gainPercent >= 0 ? "↑" : "↓"}
                  </Text>
                </View>
              </View>
              <PortfolioSparkline
                width={sparklineWidth}
                values={portfolioHistory}
              />
              <Pressable
                onPress={handleScrollToHoldings}
                hitSlop={8}
                style={styles.portfolioLinkWrap}
              >
                <Text style={styles.linkText}>לכל האחזקות ›</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.statsGrid}>
          <ProfileStatTile
            icon={<StatBookIcon />}
            iconBackground="#E0F2FE"
            label="שיעורים הושלמו"
            value={String(completedLessons.length)}
          />
          <ProfileStatTile
            icon={<StatDocIcon />}
            iconBackground="#EDE9FE"
            label="מונחים נלמדו"
            value={String(unlockedTermsCount)}
            style={styles.statCellDividerStart}
            onPress={() => openDictionary()}
          />
          <ProfileStatTile
            icon={<StatXpIcon />}
            iconBackground="#FEF0C7"
            label="XP"
            value={coins.toLocaleString("he-IL")}
            style={styles.statCellDividerTop}
          />
          <ProfileStatTile
            icon={<StatCapIcon />}
            iconBackground="#D1FADF"
            label="קורסים"
            value={
              coursesInProgress > 0
                ? `${coursesInProgress} בתהליך`
                : "0 בתהליך"
            }
            style={[styles.statCellDividerTop, styles.statCellDividerStart]}
          />
        </View>

        <View
          style={styles.holdingsSection}
          onLayout={(e) => {
            holdingsSectionYRef.current = e.nativeEvent.layout.y;
            holdingsSectionHeightRef.current = e.nativeEvent.layout.height;
          }}
        >
          <View style={styles.holdingsHeader}>
            <Text style={styles.sectionTitle}>אחזקות</Text>
            <Pressable onPress={() => openTrading()} hitSlop={8}>
              <Text style={styles.linkTextInline}>למסחר ›</Text>
            </Pressable>
          </View>
          {loading ? null : portfolio.length === 0 ? (
            <View style={styles.emptyHoldings}>
              <Text style={styles.emptyHoldingsText}>אין לך מניות עדיין</Text>
              <Pressable onPress={() => openTrading()}>
                <Text style={styles.linkTextInline}>עבור למסחר ›</Text>
              </Pressable>
            </View>
          ) : (
            sortedHoldings.map(renderHoldingRow)
          )}
        </View>

        <ProfileStreakCard
          streakDays={streakDays}
          nextLessonTitle={nextLesson?.title}
          nextLessonDuration={
            nextLesson ? estimateLessonDuration(nextLesson.stepIndex) : undefined
          }
          onContinue={continueLearning}
        />

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>התנתק</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavbar activeTab="profile" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    backgroundColor: "#FFFFFF",
  },
  profileHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 4,
    marginBottom: 18,
    gap: 14,
  },
  profileTextCol: {
    flex: 1,
    alignItems: "flex-end",
    marginEnd: 4,
  },
  userName: {
    fontSize: 24,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  profileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  xpText: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.growthGreen,
    textAlign: "right",
  },
  badgeText: {
    fontSize: 15,
    fontFamily: theme.font.family,
    color: theme.colors.warning[600],
    textAlign: "right",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: theme.font.bold,
  },
  portfolioCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EAF1F9",
    shadowColor: "#0F2233",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
    marginBottom: 10,
  },
  portfolioValue: {
    fontSize: 36,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
    letterSpacing: -0.5,
  },
  gainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  gainLabel: {
    fontSize: 14,
    color: theme.colors.neutral[500],
    fontFamily: theme.font.family,
  },
  gainPill: {
    backgroundColor: theme.colors.growthGreenLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  gainPillNegative: {
    backgroundColor: theme.colors.error[100],
  },
  gainPillText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: theme.colors.growthGreen,
  },
  gainPillTextNegative: {
    color: theme.colors.error[600],
  },
  portfolioLinkWrap: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  linkText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
    textAlign: "right",
  },
  linkTextInline: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAF1F9",
    shadowColor: "#0F2233",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCellDividerStart: {
    borderStartWidth: 1,
    borderStartColor: "#E1ECF8",
  },
  statCellDividerTop: {
    borderTopWidth: 1,
    borderTopColor: "#E1ECF8",
  },
  holdingsSection: {
    marginBottom: 14,
  },
  holdingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EAF1F9",
    shadowColor: "#0F2233",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  holdingAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  holdingAvatarText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
  },
  holdingMeta: {
    flex: 1,
    alignItems: "flex-end",
    marginLeft: 8,
  },
  holdingSymbol: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  holdingShares: {
    fontSize: 13,
    color: theme.colors.neutral[500],
    marginTop: 2,
    textAlign: "right",
    fontFamily: theme.font.family,
  },
  holdingChange: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    marginHorizontal: 6,
  },
  holdingChevron: {
    fontSize: 22,
    color: theme.colors.neutral[300],
    fontWeight: "300",
    marginRight: 2,
  },
  emptyHoldings: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAF1F9",
  },
  emptyHoldingsText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
    marginBottom: 8,
  },
  logoutBtn: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  logoutText: {
    color: theme.colors.error[600],
    fontSize: 15,
    fontFamily: theme.font.family,
  },
});
