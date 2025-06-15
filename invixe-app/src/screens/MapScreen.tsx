import React from "react";
import { StyleSheet, ScrollView, View, Dimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import LessonNode, { CIRCLE_SIZE } from "../components/map/LessonNode";
import PageBackground from "../components/ui/PageBackground";
import { lessonsRegistry, isLessonUnlocked } from "../modules/lessons/registry";
import TopBar from "../components/ui/TopBar";
import { AppText } from "../../App";
import theme from "../theme";
import Svg, { Path } from 'react-native-svg';
import { useUser } from '../context/UserContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NODE_OFFSET = 60;
const NODE_X_CENTER = SCREEN_WIDTH / 2;
const NODE_X_OFFSET = 80; // how far from center to offset left/right nodes

// Helper to determine lesson status
function getLessonStatuses(completedLessons: number[]) {
  let foundCurrent = false;
  return lessonsRegistry.map((lesson, idx) => {
    const completed = completedLessons.includes(lesson.id);
    let current = false;
    const unlocked = isLessonUnlocked(lesson.id, completedLessons);
    if (!completed && unlocked && !foundCurrent) {
      current = true;
      foundCurrent = true;
    }
    return { completed, current, unlocked };
  });
}

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

export default function MapScreen({ navigation }: Props) {
  const { completedLessons } = useUser();
  // const userPoints = 10; // TODO: Get from user progress context

  const handleLessonStart = (lessonId: number) => {
    const lesson = lessonsRegistry.find((l) => l.id === lessonId);
    if (!lesson) return;

    const unlocked = isLessonUnlocked(lessonId, completedLessons);
    if (!unlocked) {
      // TODO: Show a message that the lesson is locked
      return;
    }

    navigation.navigate("Lesson", { lessonId });
  };

  // Calculate node positions for path
  const nodePositions = lessonsRegistry.map((_, idx) => {
    const y = idx * (CIRCLE_SIZE + 48);
    const x = NODE_X_CENTER + (idx % 2 === 0 ? -NODE_X_OFFSET : NODE_X_OFFSET);
    return { x, y };
  });
  const pathD = nodePositions.reduce((d, pos, idx, arr) => {
    if (idx === 0) return `M${pos.x},${pos.y}`;
    // Use quadratic curve for smoothness
    const prev = arr[idx - 1];
    const cpx = (prev.x + pos.x) / 2;
    return d + ` Q${cpx},${prev.y + (pos.y - prev.y) / 2} ${pos.x},${pos.y}`;
  }, "");
  const lessonStatuses = getLessonStatuses(completedLessons);

  return (
    <PageBackground source={require("../assets/bg.png")}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText style={styles.title}>המסע שלך בשוק ההון</AppText>
        <View style={styles.mapContainer}>
          {/* SVG path behind nodes */}
          <Svg
            width={SCREEN_WIDTH}
            height={nodePositions[nodePositions.length - 1].y + CIRCLE_SIZE}
            style={StyleSheet.absoluteFill}
          >
            <Path
              d={pathD}
              stroke={theme.colors.primaryBlue}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.25}
            />
          </Svg>
          {lessonsRegistry.map((lesson, idx) => {
            const { completed, current, unlocked } = lessonStatuses[idx];
            const position = idx % 2 === 0 ? 'left' : 'right';
            const nodeStyle = {
              position: 'absolute' as const,
              left: nodePositions[idx].x - CIRCLE_SIZE / 2,
              top: nodePositions[idx].y,
            };
            return (
              <View key={lesson.id} style={nodeStyle}>
                <LessonNode
                  title={lesson.title}
                  unlocked={unlocked}
                  onStart={() => handleLessonStart(lesson.id)}
                  showConnector={idx < lessonsRegistry.length - 1}
                  completed={completed}
                  current={current}
                  position={position}
                />
              </View>
            );
          })}
          {/* Spacer for scroll */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontFamily: theme.font.bold,
    color: theme.colors.primaryBlue,
    marginBottom: theme.spacing.lg,
    textShadowColor: theme.colors.trustBlueDark,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  mapContainer: {
    width: SCREEN_WIDTH,
    minHeight: 600,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    paddingBottom: 100,
  },
});
