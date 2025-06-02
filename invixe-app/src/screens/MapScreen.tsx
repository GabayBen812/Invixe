import React from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import LessonNode from "../components/map/LessonNode";
import PageBackground from "../components/ui/PageBackground";
import { lessonsRegistry, isLessonUnlocked } from "../modules/lessons/registry";

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

export default function MapScreen({ navigation }: Props) {
  // TODO: Get this from user progress context
  const completedLessons: number[] = [1];
  const userPoints = 10; // TODO: Get from user progress context

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

  return (
    <PageBackground source={require("../assets/bg.png")}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>המסע שלך בשוק ההון</Text>
        {lessonsRegistry.map((lesson, idx) => (
          <LessonNode
            key={lesson.id}
            title={lesson.title}
            description={lesson.description}
            unlocked={isLessonUnlocked(lesson.id, completedLessons)}
            onStart={() => handleLessonStart(lesson.id)}
            showConnector={idx < lessonsRegistry.length - 1}
          />
        ))}
      </ScrollView>
    </PageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 32,
    textShadowColor: "#222",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
});
