import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Button from "../components/ui/Button";
import theme from "../theme";
import { useUser } from "../context/UserContext";
import { useLessons } from "../context/LessonsContext";
import {
  getNextLessonId,
  getStepIndexForLesson,
} from "../modules/lessons/registry";
import Svg, {
  Path,
  G,
  Mask,
  Ellipse,
  Defs,
  Rect,
  Pattern,
  Use,
  Image as SvgImage,
  SvgXml,
} from "react-native-svg";
import TopBar from "../components/ui/TopBar";
//@ts-ignore
import TrophyImage from "../assets/nodes/Trophy.png";

const COIN_ICON = (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.5v-1.68c1.51-.29 2.72-1.16 2.72-2.77-.01-1.54-1.31-2.46-3.66-3.09z"
      fill="#2E7D32"
    />
  </Svg>
);

const LIGHTNING_ICON = (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 2v11h3v9l7-12h-4l4-8z"
      stroke="#673AB7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

import { TROPHY_BASE64 } from "../assets/trophyData";

import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/user/add-coins`;

type Props = NativeStackScreenProps<RootStackParamList, "LessonComplete">;

export default function LessonCompleteScreen({ navigation, route }: Props) {
  const { coins, setCoins, lightnings } = useUser();
  const { lessonsRegistry } = useLessons();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lessonId = route.params?.lessonId;
  const currentLesson = React.useMemo(() => {
    if (!lessonId) return null;
    // Helper to find lesson in registry
    for (const step of lessonsRegistry) {
      const found = step.lessons.find((l) => l.id === lessonId);
      if (found) return found;
      for (const l of step.lessons) {
        if (l.sublessons) {
          const sub = l.sublessons.find((s) => s.id === lessonId);
          if (sub) return sub;
        }
      }
    }
    return null;
  }, [lessonsRegistry, lessonId]);

  // Get earned coins from params, default to 10 if not provided
  const earnedCoins = route.params?.coinsEarned ?? 10;
  const earnedXP = 70; // Mock data for now

  useEffect(() => {
    // Show content immediately, add coins in background
    const addCoins = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coins: earnedCoins }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add coins");
        }
        const data = await res.json();
        // Update local coins state
        setCoins(data.newCoins);
      } catch (e: any) {
        console.error("Error adding coins:", e);
        setError(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    };
    // Small delay to ensure screen is rendered first, then add coins
    const timer = setTimeout(() => {
      if (earnedCoins > 0) {
        addCoins();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [earnedCoins]); // Add dependency

  const handleContinue = () => {
    if (!route.params?.lessonId) {
      handleHome();
      return;
    }
    // Find next lesson
    const nextLessonId = getNextLessonId(route.params.lessonId);
    if (nextLessonId) {
      // Navigate to next lesson
      navigation.replace("Lesson", { lessonId: nextLessonId });
    } else {
      // No next lesson, go to Map
      handleHome();
    }
  };

  const handleHome = () => {
    // Determine which unit this lesson belongs to
    const unitIndex = getStepIndexForLesson(route.params.lessonId);
    navigation.navigate("Map", {
      selectedUnitIdx: unitIndex !== null ? unitIndex : undefined,
    });
  };

  // Performance stats
  const accuracy = 88; // Placeholder
  const timeSpent = "3:20"; // Placeholder

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.contentContainer}>
        <View style={styles.trophyContainer}>
          <Image
            source={TrophyImage}
            style={{ width: 140, height: 140 }} // הגדלתי מעט ל-140 כדי שייראה ברור
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>כל הכבוד!</Text>
          <Text style={styles.subtitle}>
            סיימת את {currentLesson?.title || "השיעור"}!
          </Text>
          <Text style={styles.instruction}>
            לחצו על המילון מושגים כדי לראות מה למדתם
          </Text>
        </View>

        <View style={styles.gradeCard}>
          <View style={styles.gradeHeader}>
            <View style={styles.gradeCircle}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#FFA000"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.gradeText}>B+</Text>
              <Text style={styles.gradeLabel}>ציון</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxTitle}>דיוק</Text>
              <View style={styles.statContent}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="#D32F2F"
                  />
                </Svg>
                <Text style={styles.statValue}>{accuracy}%</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statBoxTitle}>זמן</Text>
              <View style={styles.statContent}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                    fill="#D32F2F"
                  />
                </Svg>
                <Text style={styles.statValue}>{timeSpent}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.rewardsContainer}>
          <View style={[styles.rewardCard, { backgroundColor: "#B9F6CA" }]}>
            <View style={styles.rewardIconCircle}>{COIN_ICON}</View>
            <Text style={[styles.rewardValue, { color: "#2E7D32" }]}>
              +{earnedCoins}
            </Text>
            <Text style={[styles.rewardLabel, { color: "#2E7D32" }]}>
              מטבעות
            </Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Pressable style={styles.continueButton} onPress={handleContinue}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.continueButtonText}>המשך ללמוד</Text>
            )}
          </Pressable>

          <Pressable style={styles.homeButton} onPress={handleHome}>
            <Text style={styles.homeButtonText}>חזרה לבית</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3EEF9",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "center", // Center content vertically
    gap: 20, // Add consistent spacing between elements
  },
  trophyContainer: {
    justifyContent: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28, // Reduced from 32
    fontFamily: theme.font.bold,
    color: "#1565C0",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16, // Reduced from 18
    fontFamily: theme.font.bold,
    color: "#0D47A1",
    marginBottom: 4,
    textAlign: "center",
  },
  instruction: {
    fontSize: 12, // Reduced from 14
    fontFamily: theme.font.family,
    color: "#546E7A",
    textAlign: "center",
    maxWidth: 250,
  },
  gradeCard: {
    backgroundColor: "#FFECB3",
    borderRadius: 16, // Slightly reduced radius
    width: "100%",
    padding: 12, // Reduced padding
    marginBottom: 0, // Removed margin bottom to use gap instead
    alignItems: "center",
  },
  gradeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // Reduced margin
    gap: 12,
  },
  gradeCircle: {
    width: 50, // Reduced from 60
    height: 50, // Reduced from 60
    borderRadius: 25,
    backgroundColor: "#FFCA28",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFA000",
  },
  gradeText: {
    fontSize: 24, // Reduced from 32
    fontWeight: "bold",
    color: "#FFA000",
  },
  gradeLabel: {
    fontSize: 12, // Reduced from 14
    color: "#FFA000",
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#FFECB3",
    borderWidth: 1,
    borderColor: "#FFCA28",
    borderRadius: 8,
    padding: 6, // Reduced padding
    height: 70, // Reduced from 80
    justifyContent: "space-between",
  },
  statDivider: {
    width: 12,
  },
  statBoxTitle: {
    fontSize: 10, // Reduced from 12
    fontWeight: "bold",
    color: "#FFA000",
    marginBottom: 2,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 16, // Reduced from 18
    fontWeight: "bold",
    color: "#000",
  },
  rewardsContainer: {
    flexDirection: "row",
    gap: 12, // Reduced gap
    marginBottom: 20, // Reduced margin
    width: "100%",
    justifyContent: "center",
  },
  rewardCard: {
    borderRadius: 16,
    padding: 12, // Reduced padding
    alignItems: "center",
    width: 130, // Reduced width
    height: 90, // Reduced height
    justifyContent: "center",
  },
  rewardIconCircle: {
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 20, // Reduced from 24
    fontWeight: "bold",
    marginBottom: 0,
  },
  rewardLabel: {
    fontSize: 12, // Reduced from 14
  },
  buttonsContainer: {
    width: "100%",
    gap: 8, // Reduced gap
  },
  continueButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 14, // Reduced from 16
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16, // Reduced from 18
    fontWeight: "bold",
  },
  homeButton: {
    backgroundColor: "white",
    paddingVertical: 14, // Reduced from 16
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  homeButtonText: {
    color: "#1976D2",
    fontSize: 16, // Reduced from 18
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
