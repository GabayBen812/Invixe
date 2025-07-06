import React from "react";
import { StyleSheet, ScrollView, View, Dimensions, Modal, TouchableWithoutFeedback, Text, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import LessonNode, { CIRCLE_SIZE } from "../components/map/LessonNode";
import { lessonsRegistry, isLessonUnlocked, StepRegistry } from "../modules/lessons/registry";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import { AppText } from "../../App";
import theme from "../theme";
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useUser } from '../context/UserContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NODE_OFFSET = 60;
const NODE_X_CENTER = SCREEN_WIDTH / 2;
const NODE_X_OFFSET = 80; // how far from center to offset left/right nodes

// Helper to determine lesson status for new structure
function getLessonStatuses(completedLessons: number[]) {
  let foundCurrent = false;
  const statuses: { completed: boolean; current: boolean; unlocked: boolean; stepIdx: number; lessonIdx: number; lessonId: number }[] = [];
  lessonsRegistry.forEach((step, stepIdx) => {
    step.lessons.forEach((lesson, lessonIdx) => {
      const completed = completedLessons.includes(lesson.id);
      let unlocked = false;
      // All previous steps' lessons must be completed
      if (stepIdx === 0) {
        unlocked = true;
      } else {
        const prevStep = lessonsRegistry[stepIdx - 1];
        unlocked = prevStep.lessons.every(l => completedLessons.includes(l.id));
      }
      let current = false;
      if (!completed && unlocked && !foundCurrent) {
        current = true;
        foundCurrent = true;
      }
      statuses.push({ completed, current, unlocked, stepIdx, lessonIdx, lessonId: lesson.id });
    });
  });
  return statuses;
}

// SVG Coin
const CoinSVG = () => (
  <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="16" fill="#FFD700" />
    <Circle cx="16" cy="16" r="12" fill="#FFF8DC" />
    <Path d="M16 10v12" stroke="#F4B400" strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 16h8" stroke="#F4B400" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
// SVG Chest
const ChestSVG = () => (
  <Svg width={48} height={40} viewBox="0 0 48 40" fill="none">
    <Rect x="4" y="16" width="40" height="20" rx="4" fill="#B8860B" stroke="#8B5C00" strokeWidth={2}/>
    <Rect x="8" y="20" width="32" height="12" rx="2" fill="#FFD700" stroke="#8B5C00" strokeWidth={2}/>
    <Rect x="20" y="24" width="8" height="8" rx="2" fill="#FFF8DC" stroke="#8B5C00" strokeWidth={1}/>
    <Path d="M4 16c0-8 40-8 40 0" stroke="#FFD700" strokeWidth={2} fill="none"/>
  </Svg>
);
// SVG Character (simple placeholder)
const CharacterSVG = () => (
  <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="20" fill="#3F9FFF" />
    <Circle cx="18" cy="22" r="3" fill="#fff" />
    <Circle cx="30" cy="22" r="3" fill="#fff" />
    <Circle cx="18" cy="22" r="1.2" fill="#222" />
    <Circle cx="30" cy="22" r="1.2" fill="#222" />
    <Path d="M18 32c2 2 10 2 12 0" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
// SVG Footprint (larger, darker)
const FootprintSVG = ({ rotation = 0 }) => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
    <Path d="M12 20c2 0 2-3 0-3s-2 3 0 3z" fill="#333" />
    <Path d="M8 14c1 0 1-2 0-2s-1 2 0 2z" fill="#333" />
    <Path d="M16 14c1 0 1-2 0-2s-1 2 0 2z" fill="#333" />
    <Path d="M7 10c.7 0 .7-1.4 0-1.4s-.7 1.4 0 1.4z" fill="#333" />
    <Path d="M17 10c.7 0 .7-1.4 0-1.4s-.7 1.4 0 1.4z" fill="#333" />
  </Svg>
);

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

export default function MapScreen({ navigation }: Props) {
  const { completedLessons } = useUser();
  // const userPoints = 10; // TODO: Get from user progress context
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedLesson, setSelectedLesson] = React.useState<any>(null);

  const handleLessonStart = (lessonId: number) => {
    setModalVisible(false);
    let lessonMeta = undefined;
    for (const step of lessonsRegistry) {
      const found = step.lessons.find((l) => l.id === lessonId);
      if (found) {
        lessonMeta = found;
        break;
      }
    }
    if (!lessonMeta) return;

    const unlocked = isLessonUnlocked(lessonId, completedLessons);
    if (!unlocked) {
      // TODO: Show a message that the lesson is locked
      return;
    }

    navigation.navigate("Lesson", { lessonId });
  };

  const handleTabPress = (tab: 'map' | 'profile' | 'shop' | 'graph') => {
    switch (tab) {
      case 'map':
        // Already on map screen, do nothing
        break;
      case 'graph':
        navigation.navigate('Sandbox');
        break;
      case 'profile':
        // TODO: Navigate to profile screen
        console.log('profile pressed');
        break;
      case 'shop':
        // TODO: Navigate to shop screen
        console.log('Shop pressed');
        break;
    }
  };

  // Each node is a step/unit
  const stepNodes = lessonsRegistry.map((step, stepIdx) => ({ step, stepIdx }));

  // Calculate node positions for path (one per step)
  const nodePositions = stepNodes.map((_, idx) => {
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
  // For each step, check if all lessons are completed
  const stepStatuses = lessonsRegistry.map((step, idx) => {
    const completed = step.lessons.every(l => completedLessons.includes(l.id));
    let unlocked = false;
    if (idx === 0) {
      unlocked = true;
    } else {
      unlocked = lessonsRegistry[idx - 1].lessons.every(l => completedLessons.includes(l.id));
    }
    let current = false;
    if (!completed && unlocked && !stepNodes.some((n, i) => i < idx && !stepStatuses?.[i]?.completed)) {
      current = true;
    }
    return { completed, unlocked, current };
  });

  return (
    <View style={[styles.container, { backgroundColor: '#A0CFFF' }]}> 
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Duolingo-style unit/lesson container */}
        <View style={{
          backgroundColor: '#3F9FFF',
          borderRadius: 18,
          paddingVertical: 14,
          paddingHorizontal: 28,
          marginBottom: 24,
          alignSelf: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.10,
          shadowRadius: 8,
          elevation: 4,
          width: '90%',
          alignItems: 'flex-end',
        }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 }}>יחידה 1</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, marginTop: 2 }}>שיעור ראשון: מבוא לשוק ההון</Text>
        </View>
        <View style={styles.mapContainer}>
          {/* Footprints between nodes */}
          {stepNodes.length > 1 && nodePositions.map((pos, idx) => {
            if (idx === 0) return null;
            const prev = nodePositions[idx - 1];
            // Calculate direction and distance
            const dx = pos.x - prev.x;
            const dy = pos.y - prev.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.floor(dist / 24); // closer together
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            return Array.from({ length: steps }).map((_, stepIdx) => {
              const t = (stepIdx + 1) / (steps + 1);
              const x = prev.x + dx * t;
              const y = prev.y + dy * t;
              return (
                <View
                  key={`footprint-step-${idx}-${stepIdx}`}
                  style={{
                    position: 'absolute',
                    left: x - 20,
                    top: y - 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <FootprintSVG rotation={angle} />
                </View>
              );
            });
          })}
          {stepNodes.map(({ step, stepIdx }, idx) => {
            const { completed, current, unlocked } = stepStatuses[idx];
            const position = idx % 2 === 0 ? 'left' : 'right';
            const nodeStyle = {
              position: 'absolute' as const,
              left: nodePositions[idx].x - CIRCLE_SIZE / 2,
              top: nodePositions[idx].y,
              alignItems: 'center' as const,
            };
            return (
              <View key={step.step} style={nodeStyle}>
                {/* Glow for current node */}
                {current && (
                  <View style={{
                    position: 'absolute',
                    left: CIRCLE_SIZE / 2 - 36,
                    top: CIRCLE_SIZE / 2 - 36,
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: 'rgba(76,217,100,0.25)',
                    zIndex: 0,
                  }} />
                )}
                <LessonNode
                  unlocked={unlocked}
                  onStart={() => {
                    setSelectedLesson(step);
                    setModalVisible(true);
                  }}
                  showConnector={idx < stepNodes.length - 1}
                  completed={completed}
                  current={current}
                  position={position}
                  lessonType={step.lessons[0]?.lessonType || 'info'}
                />
              </View>
            );
          })}
          {/* Modal for lesson info */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableWithoutFeedback>
                  <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 28, minWidth: 320, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 }}>
                    <CharacterSVG />
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3F9FFF', marginBottom: 12, textAlign: 'center', marginTop: 8 }}>{selectedLesson?.lessons?.[0]?.title || ''}</Text>
                    <Text style={{ fontSize: 16, color: '#222', marginBottom: 16, textAlign: 'center' }}>{selectedLesson?.lessons?.[0]?.description || ''}</Text>
                    {/* List lessons in this unit */}
                    {selectedLesson?.lessons?.map((lesson: any, idx: number) => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      return (
                        <View key={lesson.id} style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8, width: 220, justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 16, color: isCompleted ? '#4CD964' : '#222', fontWeight: isCompleted ? 'bold' : 'normal', textAlign: 'right', flex: 1 }}>
                            שיעור {idx + 1}
                          </Text>
                          {isCompleted ? (
                            <Text style={{ color: '#4CD964', fontWeight: 'bold', fontSize: 22, marginLeft: 8, textAlign: 'left' }}>✔️</Text>
                          ) : null}
                        </View>
                      );
                    })}
                    {/* Start button for next incomplete lesson */}
                    {(() => {
                      const nextLesson = selectedLesson?.lessons?.find((l: any) => !completedLessons.includes(l.id));
                      if (!nextLesson) return null;
                      return (
                        <Pressable
                          style={{ backgroundColor: '#4CD964', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 36, marginTop: 16 }}
                          onPress={() => handleLessonStart(nextLesson.id)}
                        >
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>התחל שיעור {selectedLesson.lessons.findIndex((l: any) => l.id === nextLesson.id) + 1}</Text>
                        </Pressable>
                      );
                    })()}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          {/* Spacer for scroll */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
      <BottomNavbar activeTab="map" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
