import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

const lessons = [
  { id: 1, title: "מבוא לשוק ההון", unlocked: true },
  { id: 2, title: "מהי מניה?", unlocked: false },
  { id: 3, title: "איך קונים מניה?", unlocked: false },
  { id: 4, title: "סיכונים והזדמנויות", unlocked: false },
];

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

export default function MapScreen({ navigation }: Props) {
  return (
    <ImageBackground source={require("../assets/bg.png")} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>המסע שלך בשוק ההון</Text>
        {lessons.map((lesson, idx) => (
          <View key={lesson.id} style={styles.nodeRow}>
            <View
              style={[
                styles.node,
                lesson.unlocked ? styles.nodeUnlocked : styles.nodeLocked,
              ]}
            >
              <Text style={styles.nodeText}>{lesson.title}</Text>
              {lesson.unlocked ? (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() =>
                    navigation.navigate("Lesson", { lessonId: lesson.id })
                  }
                >
                  <Text style={styles.startBtnText}>התחל</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.lockedText}>🔒</Text>
              )}
            </View>
            {idx < lessons.length - 1 && <View style={styles.connector} />}
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, resizeMode: "cover" },
  scrollContent: { alignItems: "center", paddingVertical: 40 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 32,
    textShadowColor: "#222",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  nodeRow: { alignItems: "center" },
  node: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
  },
  nodeUnlocked: { borderColor: "#4caf50", borderWidth: 2 },
  nodeLocked: { borderColor: "#aaa", borderWidth: 2, opacity: 0.6 },
  nodeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e355e",
    marginBottom: 8,
  },
  startBtn: {
    backgroundColor: "#4caf50",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  startBtnText: { color: "white", fontSize: 18, fontWeight: "bold" },
  lockedText: { fontSize: 22, color: "#aaa", marginTop: 4 },
  connector: {
    width: 4,
    height: 32,
    backgroundColor: "#4caf50",
    marginBottom: 8,
  },
});
