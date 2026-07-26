import { useMemo, useCallback, useRef, useState, useEffect } from "react";
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
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import PortfolioSparkline from "../components/profile/PortfolioSparkline";
import ProfileStatTile from "../components/profile/ProfileStatTile";
import ProfileStreakCard from "../components/profile/ProfileStreakCard";
import TradingHistorySection from "../components/profile/TradingHistorySection";
import theme from "../theme";
import { useUser } from "../context/UserContext";
import { useDictionary } from "../context/DictionaryContext";
import { usePortfolio } from "../context/PortfolioContext";
import { useLessons } from "../context/LessonsContext";
import { profileAvatarKey } from "../utils/storage";
import { getDisplayFirstName, getDisplayFullName, hasRealFirstName } from "../utils/userDisplayName";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path, Circle } from "react-native-svg";
import {
  DICTIONARY_ENTRIES,
  isEntryUnlocked,
} from "../data/dictionary";
import {
  countUnitsInProgress,
  findFirstIncompleteLesson,
} from "../modules/lessons/lessonNavigation";
import {
  openMapFromTab,
  resetToLessonScreen,
} from "../navigation/mapNavigation";
import {
  formatPercent,
  formatMoney,
  type NormalizedHolding,
} from "../utils/portfolioNormalize";
import { getStockLogo } from "../assets/StockLogos";
import { TERMS_POLICY_URL } from "../config/externalLinks";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const ICON_STROKE = "#475569";

function getInvestorBadge(completedLessonsCount: number): string {
  if (completedLessonsCount >= 30) return "משקיע מנוסה";
  if (completedLessonsCount >= 10) return "משקיע מתקדם";
  return "משקיע מתחיל";
}

const CameraBadgeIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8h3l1.5-2h7L17 8h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 012-2z"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={14} r={3.2} stroke="#FFFFFF" strokeWidth={2} />
  </Svg>
);

const TrophyMiniIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z"
      stroke="#B45309"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 6H5a2 2 0 000 4h2M17 6h2a2 2 0 010 4h-2"
      stroke="#B45309"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

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
    cash,
    completedLessons,
    lessonAttempts,
    logout,
    deleteAccount,
    currentUserEmail,
    firstName,
    lastName,
    updateProfileName,
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
    periodReturns: periodReturnsFromSeries,
  } = usePortfolio();

  useFocusEffect(
    useCallback(() => {
      void refreshPortfolio();
      setHistoryRefreshKey((k) => k + 1);
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

  const resolvedFirstName = getDisplayFirstName(firstName);
  const resolvedLastName = lastName?.trim() || "";
  const userName = getDisplayFullName(firstName, lastName);
  const showNameSetup = !hasRealFirstName(firstName);

  const userInitials = (() => {
    if (showNameSetup) return "?";
    const first = resolvedFirstName.charAt(0);
    const last = resolvedLastName.charAt(0);
    return (first + last).trim() || resolvedFirstName.slice(0, 2).toUpperCase();
  })();

  const sparklineWidth = Math.min(screenWidth - 80, 320);

  const periodReturns = periodReturnsFromSeries;

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollViewportHeightRef = useRef(400);
  const holdingsSectionYRef = useRef(0);
  const holdingsSectionHeightRef = useRef(0);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameDraftFirst, setNameDraftFirst] = useState("");
  const [nameDraftLast, setNameDraftLast] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(
          profileAvatarKey(currentUserEmail),
        );
        if (!cancelled) setAvatarUri(stored);
      } catch {
        if (!cancelled) setAvatarUri(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserEmail]);

  const persistAvatar = useCallback(
    async (uri: string | null) => {
      setAvatarUri(uri);
      const key = profileAvatarKey(currentUserEmail);
      try {
        if (uri) await AsyncStorage.setItem(key, uri);
        else await AsyncStorage.removeItem(key);
      } catch {
        // ignore persistence failures
      }
    },
    [currentUserEmail],
  );

  const pickFromLibrary = useCallback(async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "אין גישה לתמונות",
        "אשר גישה לגלריה בהגדרות המכשיר כדי להוסיף תמונת פרופיל.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await persistAvatar(result.assets[0].uri);
    }
  }, [persistAvatar]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "אין גישה למצלמה",
        "אשר גישה למצלמה בהגדרות המכשיר כדי לצלם תמונת פרופיל.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await persistAvatar(result.assets[0].uri);
    }
  }, [persistAvatar]);

  const openAvatarOptions = useCallback(() => {
    const buttons: {
      text: string;
      style?: "cancel" | "destructive" | "default";
      onPress?: () => void;
    }[] = [
      {
        text: "בחירה מהגלריה",
        onPress: () => {
          void pickFromLibrary();
        },
      },
      {
        text: "צילום תמונה",
        onPress: () => {
          void takePhoto();
        },
      },
    ];
    if (avatarUri) {
      buttons.push({
        text: "הסרת תמונה",
        style: "destructive",
        onPress: () => {
          void persistAvatar(null);
        },
      });
    }
    buttons.push({ text: "ביטול", style: "cancel" });

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: buttons.map((b) => b.text),
          cancelButtonIndex: buttons.length - 1,
          destructiveButtonIndex: avatarUri
            ? buttons.findIndex((b) => b.style === "destructive")
            : undefined,
          title: "תמונת פרופיל",
        },
        (index) => {
          const action = buttons[index];
          action?.onPress?.();
        },
      );
      return;
    }

    Alert.alert(
      "תמונת פרופיל",
      "בחר איך לעדכן את התמונה",
      buttons.map(({ text, style, onPress }) => ({ text, style, onPress })),
    );
  }, [avatarUri, persistAvatar, pickFromLibrary, takePhoto]);

  const openNameModal = useCallback(() => {
    setNameDraftFirst(firstName?.trim() || "");
    setNameDraftLast(lastName?.trim() || "");
    setShowNameModal(true);
  }, [firstName, lastName]);

  const closeNameModal = useCallback(() => {
    if (savingName) return;
    setShowNameModal(false);
  }, [savingName]);

  const handleSaveName = useCallback(async () => {
    const trimmedFirst = nameDraftFirst.trim();
    if (!trimmedFirst) {
      Alert.alert("חסר שם", "נא להזין שם פרטי.");
      return;
    }

    setSavingName(true);
    const ok = await updateProfileName(trimmedFirst, nameDraftLast.trim());
    setSavingName(false);

    if (ok) {
      setShowNameModal(false);
      return;
    }

    Alert.alert(
      "שגיאה",
      "לא הצלחנו לשמור את השם. בדוק את החיבור ונסה שוב.",
    );
  }, [nameDraftFirst, nameDraftLast, updateProfileName]);

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
        openMapFromTab(navigation);
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

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "מחיקת חשבון",
      "פעולה זו תמחק לצמיתות את החשבון, ההתקדמות, התיק והיסטוריית המסחר. לא ניתן לשחזר.",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק חשבון",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setDeletingAccount(true);
              const ok = await deleteAccount();
              setDeletingAccount(false);
              if (ok) {
                navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
                return;
              }
              Alert.alert(
                "שגיאה",
                "לא הצלחנו למחוק את החשבון. בדוק את החיבור ונסה שוב.",
              );
            })();
          },
        },
      ],
    );
  }, [deleteAccount, navigation]);

  const openTermsPolicy = useCallback(() => {
    if (!TERMS_POLICY_URL) return;
    void Linking.openURL(TERMS_POLICY_URL);
  }, []);

  const openTrading = (symbol?: string) =>
    navigation.navigate("Sandbox", symbol ? { symbol } : undefined);

  const continueLearning = () => {
    if (nextLesson) {
      resetToLessonScreen(
        navigation,
        nextLesson.lessonId,
        nextLesson.unitId,
        nextLesson.stepIndex,
      );
      return;
    }
    openMapFromTab(navigation);
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
  ) => {
    const Logo = getStockLogo(holding.symbol);
    return (
      <Pressable
        key={holding.id}
        style={styles.holdingRow}
        onPress={() => openTrading(holding.symbol)}
      >
        <View
          style={[
            styles.holdingAvatar,
            Logo ? styles.holdingAvatarLogoWrap : null,
          ]}
        >
          {Logo ? (
            <Logo width={26} height={26} />
          ) : (
            <Text style={styles.holdingAvatarText}>
              {holding.symbol.slice(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.holdingMeta}>
          <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
          <Text style={styles.holdingShares}>
            {holding.shares} מניות · קנייה {formatMoney(holding.avgPrice)}
          </Text>
        </View>
        {renderChangeLabel(holding.changePercent)}
        <Text style={styles.holdingChevron}>›</Text>
      </Pressable>
    );
  };

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
          <Pressable
            onPress={openAvatarOptions}
            style={styles.avatarPressable}
            accessibilityRole="button"
            accessibilityLabel="עדכון תמונת פרופיל"
          >
            <View style={styles.avatarRing}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{userInitials}</Text>
                </View>
              )}
            </View>
            <View style={styles.avatarCameraBadge}>
              <CameraBadgeIcon />
            </View>
          </Pressable>
          <View style={styles.profileTextCol}>
            {showNameSetup ? (
              <Pressable
                onPress={openNameModal}
                accessibilityRole="button"
                accessibilityLabel="הוסף את שמך"
                style={({ pressed }) => [
                  styles.nameSetupBlock,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.userName, styles.userNamePlaceholder]}>
                  {userName}
                </Text>
                <View style={styles.addNameChip}>
                  <Text style={styles.addNameChipText}>+ הוסף את שמך</Text>
                </View>
              </Pressable>
            ) : (
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
            )}
            <View style={styles.badgeChip}>
              <TrophyMiniIcon />
              <Text style={styles.badgeText}>
                {getInvestorBadge(completedLessons.length)}
              </Text>
            </View>
            <Text style={styles.avatarHint}>
              {showNameSetup
                ? "הקש על «הוסף את שמך» או על התמונה לעדכון"
                : "הקש על התמונה לעדכון"}
            </Text>
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
                {formatMoney(portfolioStats.totalValue)}
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
              {(periodReturns.day != null ||
                periodReturns.week != null ||
                periodReturns.month != null) && (
                <View style={styles.periodRow}>
                  {[
                    { label: "יום", value: periodReturns.day },
                    { label: "שבוע", value: periodReturns.week },
                    { label: "חודש", value: periodReturns.month },
                  ].map(({ label, value }, i) => {
                    if (value === null) return null;
                    const positive = value > 0.05;
                    const negative = value < -0.05;
                    const color = positive
                      ? theme.colors.growthGreen
                      : negative
                        ? theme.colors.error[600]
                        : theme.colors.neutral[400];
                    const bg = positive
                      ? theme.colors.success[100]
                      : negative
                        ? theme.colors.error[100]
                        : theme.colors.neutral[100];
                    const sign = positive ? "+" : "";
                    return (
                      <View key={label} style={[styles.periodItem, i > 0 && styles.periodItemBorder]}>
                        <Text style={styles.periodLabel}>{label}</Text>
                        <View style={[styles.periodPill, { backgroundColor: bg }]}>
                          <Text style={[styles.periodValue, { color }]}>
                            {sign}{value.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
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
            label="סה״כ הון"
            value={formatMoney(cash + portfolioStats.totalValue)}
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

        <TradingHistorySection
          refreshKey={historyRefreshKey}
          onOpenTrading={() => openTrading()}
        />

        <ProfileStreakCard
          streakDays={streakDays}
          nextLessonTitle={nextLesson?.title}
          nextLessonDuration={
            nextLesson ? estimateLessonDuration(nextLesson.stepIndex) : undefined
          }
          onContinue={continueLearning}
        />

        <View style={styles.accountActions}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>התנתק</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={[
              styles.deleteAccountBtn,
              deletingAccount && styles.deleteAccountBtnDisabled,
            ]}
            disabled={deletingAccount}
          >
            {deletingAccount ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.deleteAccountText}>מחק חשבון</Text>
            )}
          </TouchableOpacity>

          <Pressable
            onPress={openTermsPolicy}
            style={styles.termsLinkWrap}
            accessibilityRole="link"
            accessibilityLabel="תנאי שימוש ומדיניות פרטיות"
          >
            <Text style={styles.termsLinkText}>תנאי שימוש ומדיניות פרטיות</Text>
          </Pressable>
        </View>
      </ScrollView>
      <BottomNavbar activeTab="profile" onTabPress={handleTabPress} />

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={closeNameModal}
      >
        <KeyboardAvoidingView
          style={styles.nameModalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.nameModalBackdrop} onPress={closeNameModal} />
          <View style={styles.nameModalSheet}>
            <Text style={styles.nameModalTitle}>איך לקרוא לך?</Text>
            <Text style={styles.nameModalSubtitle}>
              השם יופיע בפרופיל ובמסך הבית.
            </Text>

            <Text style={styles.nameFieldLabel}>שם פרטי</Text>
            <TextInput
              style={styles.nameInput}
              value={nameDraftFirst}
              onChangeText={setNameDraftFirst}
              placeholder="לדוגמה: יוסי"
              placeholderTextColor={theme.colors.neutral[400]}
              textAlign="right"
              autoFocus
              returnKeyType="next"
            />

            <Text style={styles.nameFieldLabel}>שם משפחה (אופציונלי)</Text>
            <TextInput
              style={styles.nameInput}
              value={nameDraftLast}
              onChangeText={setNameDraftLast}
              placeholder="לדוגמה: כהן"
              placeholderTextColor={theme.colors.neutral[400]}
              textAlign="right"
              returnKeyType="done"
              onSubmitEditing={() => void handleSaveName()}
            />

            <View style={styles.nameModalActions}>
              <Pressable
                style={styles.nameModalCancel}
                onPress={closeNameModal}
                disabled={savingName}
              >
                <Text style={styles.nameModalCancelText}>ביטול</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.nameModalSave,
                  (!nameDraftFirst.trim() || savingName) &&
                    styles.nameModalSaveDisabled,
                ]}
                onPress={() => void handleSaveName()}
                disabled={!nameDraftFirst.trim() || savingName}
              >
                {savingName ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.nameModalSaveText}>שמור</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    marginTop: 8,
    marginBottom: 20,
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: "#F7FAFD",
    borderWidth: 1,
    borderColor: "#E8EEF5",
  },
  profileTextCol: {
    flex: 1,
    alignItems: "flex-end",
    gap: 8,
  },
  userName: {
    fontSize: 24,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  userNamePlaceholder: {
    color: theme.colors.neutral[400],
  },
  nameSetupBlock: {
    alignItems: "flex-end",
    gap: 8,
  },
  addNameChip: {
    backgroundColor: theme.colors.info[100],
    borderWidth: 1,
    borderColor: theme.colors.primary[400],
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addNameChipText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[600],
    textAlign: "right",
  },
  pressed: {
    opacity: 0.88,
  },
  badgeChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: "#B45309",
    textAlign: "right",
  },
  avatarHint: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "right",
  },
  avatarPressable: {
    position: "relative",
    flexShrink: 0,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 3,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 39,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 39,
    backgroundColor: theme.colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: theme.font.bold,
  },
  avatarCameraBadge: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary[400],
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row-reverse",
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
  holdingAvatarLogoWrap: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAF1F9",
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
  accountActions: {
    marginTop: 4,
    gap: 10,
    alignItems: "stretch",
  },
  deleteAccountBtn: {
    alignSelf: "stretch",
    backgroundColor: theme.colors.error[600],
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAccountBtnDisabled: {
    opacity: 0.7,
  },
  deleteAccountText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: theme.font.bold,
  },
  termsLinkWrap: {
    alignSelf: "center",
    paddingVertical: 6,
    marginTop: 2,
  },
  termsLinkText: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "center",
    textDecorationLine: "underline",
  },
  periodRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 4,
    marginBottom: 6,
  },
  periodItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  periodItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.neutral[200],
  },
  periodLabel: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
  },
  periodPill: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  periodValue: {
    fontSize: 13,
    fontFamily: theme.font.bold,
  },
  nameModalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  nameModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 34, 51, 0.45)",
  },
  nameModalSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    gap: 8,
    shadowColor: "#0F2233",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  nameModalTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  nameModalSubtitle: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "right",
    marginBottom: 8,
  },
  nameFieldLabel: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[700],
    textAlign: "right",
    marginTop: 4,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 12,
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: theme.font.family,
    color: theme.colors.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  nameModalActions: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 12,
  },
  nameModalCancel: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.neutral[100],
  },
  nameModalCancelText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[600],
  },
  nameModalSave: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[500],
    minHeight: 46,
  },
  nameModalSaveDisabled: {
    opacity: 0.5,
  },
  nameModalSaveText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
});
