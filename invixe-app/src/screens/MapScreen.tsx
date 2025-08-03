import React, { useRef } from "react";
import { StyleSheet, ScrollView, View, Dimensions, Modal, TouchableWithoutFeedback, Text, Pressable, Animated } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import LessonNode, { CIRCLE_SIZE } from "../components/map/LessonNode";
import { lessonsRegistry, isLessonUnlocked, StepRegistry } from "../modules/lessons/registry";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import { AppText } from "../../App";
import theme from "../theme";
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, Text as SvgText, G } from 'react-native-svg';
import { useUser } from '../context/UserContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NODE_OFFSET = 60;

// Icon components for modal
const InfoIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="infoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#3B82F6" />
        <Stop offset="100%" stopColor="#1D4ED8" />
      </LinearGradient>
    </Defs>
    <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="url(#infoGradient)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="url(#infoGradient)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const MemorizeIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="memorizeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#8B5CF6" />
        <Stop offset="100%" stopColor="#6D28D9" />
      </LinearGradient>
    </Defs>
    <Path d="M12 2C8.5 2 6 4.5 6 8c0 1.5 0.5 3 1.5 4L12 17.5L16.5 12c1-1 1.5-2.5 1.5-4 0-3.5-2.5-6-6-6z" stroke="url(#memorizeGradient)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="8" r="2" stroke="url(#memorizeGradient)" strokeWidth={2.5}/>
  </Svg>
);

const PracticeIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="practiceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>
    <Circle cx="12" cy="12" r="10" stroke="url(#practiceGradient)" strokeWidth={2.5}/>
    <Circle cx="12" cy="12" r="6" stroke="url(#practiceGradient)" strokeWidth={2.5}/>
    <Circle cx="12" cy="12" r="2" fill="url(#practiceGradient)"/>
  </Svg>
);

const TestIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="testGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#10B981" />
        <Stop offset="100%" stopColor="#059669" />
      </LinearGradient>
    </Defs>
    <Circle cx="12" cy="12" r="10" stroke="url(#testGradient)" strokeWidth={2.5}/>
    <Path d="M9 12l2 2 4-4" stroke="url(#testGradient)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
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

// Enhanced SVG Components with Gradients and Animations

// Professional Progress Bar SVG
const ProgressBarSVG = ({ progress, width = 200 }: { progress: number; width?: number }) => (
  <Svg width={width} height={8} viewBox={`0 0 ${width} 8`}>
    <Defs>
      <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#0EA5E9" />
        <Stop offset="50%" stopColor="#3B82F6" />
        <Stop offset="100%" stopColor="#6366F1" />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width={width} height="8" rx="4" fill="#E2E8F0" />
    <Rect x="0" y="0" width={width * progress} height="8" rx="4" fill="url(#progressGradient)" />
  </Svg>
);

// Streak Fire SVG
const StreakFireSVG = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2s3 7.5 3 11a3 3 0 01-6 0c0-3.5 3-11 3-11z" fill="#FF6B35" />
    <Path d="M12 6s2 5 2 7.5a2 2 0 01-4 0c0-2.5 2-7.5 2-7.5z" fill="#FFD23F" />
  </Svg>
);

// XP Star SVG
const XPStarSVG = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FFD700" stroke="#F4B400" strokeWidth={1} />
  </Svg>
);

// Compact Coin SVG
const CoinSVG = ({ animated = false }: { animated?: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill="#FFB800" />
    <Circle cx="10" cy="10" r="7" fill="#FFC83D" />
    <SvgText x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#B8860B">$</SvgText>
  </Svg>
);

// Enhanced Character SVG with better details
const CharacterSVG = ({ size = 64 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="characterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#3F9FFF" />
        <Stop offset="100%" stopColor="#1E90FF" />
      </LinearGradient>
    </Defs>
    <Circle cx="24" cy="24" r="20" fill="url(#characterGradient)" stroke="#1E40AF" strokeWidth={2} />
    <Circle cx="18" cy="20" r="3" fill="#fff" />
    <Circle cx="30" cy="20" r="3" fill="#fff" />
    <Circle cx="18" cy="20" r="1.5" fill="#222" />
    <Circle cx="30" cy="20" r="1.5" fill="#222" />
    <Path d="M16 30c3 3 10 3 16 0" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" />
    <Circle cx="14" cy="16" r="2" fill="#FFB6C1" />
    <Circle cx="34" cy="16" r="2" fill="#FFB6C1" />
  </Svg>
);

// Enhanced Footprint with better styling
const FootprintSVG = ({ rotation = 0, color = "#4A5568" }: { rotation?: number; color?: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
    <Path d="M12 18c2 0 2.5-2 0.5-2.5s-2.5 2.5-0.5 2.5z" fill={color} opacity={0.7} />
    <Path d="M8 13c1.2 0 1.2-1.5 0-1.5s-1.2 1.5 0 1.5z" fill={color} opacity={0.7} />
    <Path d="M16 13c1.2 0 1.2-1.5 0-1.5s-1.2 1.5 0 1.5z" fill={color} opacity={0.7} />
    <Path d="M7 9c.8 0 .8-1.2 0-1.2s-.8 1.2 0 1.2z" fill={color} opacity={0.7} />
    <Path d="M17 9c.8 0 .8-1.2 0-1.2s-.8 1.2 0 1.2z" fill={color} opacity={0.7} />
  </Svg>
);

type Props = NativeStackScreenProps<RootStackParamList, "Map">;

export default function MapScreen({ navigation }: Props) {
  const { completedLessons, coins } = useUser();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedLesson, setSelectedLesson] = React.useState<any>(null);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(1)).current;
  const stickyHeaderOpacity = useRef(new Animated.Value(0)).current;
  
  // Calculate user progress
  const totalLessons = lessonsRegistry.reduce((total, step) => total + step.lessons.length, 0);
  const completedCount = completedLessons.length;
  const progressPercentage = totalLessons > 0 ? completedCount / totalLessons : 0;
  const currentStreak = 7; // TODO: Calculate actual streak from user data
  const totalXP = completedCount * 10; // 10 XP per lesson
  
  // Handle scroll animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const threshold = 80; // Start animating after 80px scroll
        const maxScroll = 160; // Complete animation at 160px
        
        if (offsetY <= threshold) {
          // Show full hero, hide sticky header
          Animated.parallel([
            Animated.timing(heroOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(stickyHeaderOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        } else if (offsetY >= maxScroll) {
          // Hide hero, show sticky header
          Animated.parallel([
            Animated.timing(heroOpacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: false,
            }),
            Animated.timing(stickyHeaderOpacity, {
              toValue: 1,
              duration: 250,
              useNativeDriver: false,
            }),
          ]).start();
        } else {
          // Interpolate between states
          const progress = (offsetY - threshold) / (maxScroll - threshold);
          const heroOpacityValue = 1 - progress;
          const stickyOpacityValue = progress;
          
          heroOpacity.setValue(heroOpacityValue);
          stickyHeaderOpacity.setValue(stickyOpacityValue);
        }
      },
    }
  );

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
        navigation.navigate('Profile');
        break;
      case 'shop':
        navigation.navigate('Shop');
        break;
    }
  };

  // Each node is a step/unit
  // Create nodes for individual lessons instead of just units
  const allLessons = lessonsRegistry.flatMap((step, stepIdx) => 
    step.lessons.map(lesson => ({ lesson, stepIdx, step }))
  );

  // Calculate node positions for each lesson
  const nodePositions = allLessons.map((_, idx) => {
    const y = idx * (CIRCLE_SIZE + 80); // More spacing between lessons for better scroll
    const x = NODE_X_CENTER + (idx % 2 === 0 ? -NODE_X_OFFSET : NODE_X_OFFSET);
    return { x, y };
  });
  
  // Calculate total height needed for all lessons
  const totalMapHeight = allLessons.length * (CIRCLE_SIZE + 80) + 200;

  // Calculate lesson statuses
  const lessonStatuses = allLessons.map((lessonData, idx) => {
    const { lesson } = lessonData;
    const completed = completedLessons.includes(lesson.id);
    const unlocked = isLessonUnlocked(lesson.id, completedLessons);
    
    // Current lesson is the first uncompleted, unlocked lesson
    let current = false;
    if (!completed && unlocked) {
      // Check if this is the first uncompleted lesson
      const prevLessonsCompleted = allLessons.slice(0, idx).every(l => completedLessons.includes(l.lesson.id));
      if (prevLessonsCompleted) {
        current = true;
      }
    }
    
    return { completed, unlocked, current, lesson, stepIdx: lessonData.stepIdx };
  });

  return (
    <View style={styles.container}> 
      <TopBar />
      
      {/* Sticky Minimal Header */}
      <Animated.View style={[
        styles.stickyHeader,
        {
          opacity: stickyHeaderOpacity,
          transform: [
            {
              translateY: stickyHeaderOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [-60, 0],
                extrapolate: 'clamp',
              })
            }
          ]
        }
      ]}>
        <View style={styles.stickyHeaderContent}>
          <View style={styles.stickyHeaderLeft}>
            <View style={styles.stickyBadge}>
              <Text style={styles.stickyBadgeText}>📈</Text>
            </View>
            <Text style={styles.stickyTitle}>מסלול שוק ההון</Text>
          </View>
          <View style={styles.stickyHeaderRight}>
            <Text style={styles.stickyProgress}>
              {Math.round(progressPercentage * 100)}%
            </Text>
            <View style={styles.miniProgressBar}>
              <ProgressBarSVG 
                progress={progressPercentage} 
                width={60} 
              />
            </View>
          </View>
        </View>
      </Animated.View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        
        {/* Animated Hero Section with Elegant Unit Display */}
        <Animated.View style={[
          styles.heroSection,
          {
            opacity: heroOpacity,
          }
        ]}>
          <View style={styles.unitHeader}>
            <View style={styles.unitBadge}>
              <Text style={styles.unitBadgeText}>קורס מלא</Text>
            </View>
            <Text style={styles.unitTitle}>מסלול שוק ההון</Text>
            <Text style={styles.unitSubtitle}>
              למד ניתוח טכני, מסחר במניות והשקעות חכמות
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {completedCount} מתוך {totalLessons} שיעורים הושלמו
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <ProgressBarSVG 
                progress={progressPercentage} 
                width={SCREEN_WIDTH - 60} 
              />
            </View>
          </View>
        </Animated.View>
        <View style={[styles.mapContainer, { minHeight: totalMapHeight }]}>
          {/* Beautiful Curved Paths */}
          <Svg 
            style={{ position: 'absolute', top: 0, left: 0 }}
            width={SCREEN_WIDTH} 
            height={totalMapHeight}
          >
            <Defs>
              {/* Stock Market Chart Gradient - Bullish */}
              <LinearGradient id="bullishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#00C896" stopOpacity="0.9" />
                <Stop offset="50%" stopColor="#22C55E" stopOpacity="0.7" />
                <Stop offset="100%" stopColor="#16A34A" stopOpacity="0.4" />
              </LinearGradient>
              
              {/* Stock Market Chart Gradient - Neutral/Pending */}
              <LinearGradient id="neutralGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <Stop offset="50%" stopColor="#1D4ED8" stopOpacity="0.6" />
                <Stop offset="100%" stopColor="#1E40AF" stopOpacity="0.3" />
              </LinearGradient>
              
              {/* Glowing effect for current path */}
              <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                <Stop offset="100%" stopColor="#D97706" stopOpacity="0.5" />
              </LinearGradient>
            </Defs>
            
            {allLessons.length > 1 && nodePositions.map((pos, idx) => {
              if (idx === 0) return null;
              const prev = nodePositions[idx - 1];
              const isPathCompleted = lessonStatuses[idx - 1]?.completed;
              
              // Create beautiful curved path - properly connecting center to center
              const startX = prev.x;
              const startY = prev.y + CIRCLE_SIZE / 2;
              const endX = pos.x;
              const endY = pos.y + CIRCLE_SIZE / 2;
              
              // Calculate control points for smooth flowing curve
              const midY = (startY + endY) / 2;
              const curve = Math.abs(endX - startX) * 0.6; // More pronounced curve
              const control1X = startX + (endX > startX ? curve : -curve);
              const control1Y = startY + (endY - startY) * 0.4;
              const control2X = endX + (endX > startX ? -curve : curve);
              const control2Y = endY - (endY - startY) * 0.4;
              
              const pathData = `M ${startX} ${startY} 
                               C ${control1X} ${control1Y}, 
                                 ${control2X} ${control2Y}, 
                                 ${endX} ${endY}`;
              
              const isCurrent = lessonStatuses[idx]?.current;
              const strokeGradient = isPathCompleted ? "url(#bullishGradient)" : 
                                   isCurrent ? "url(#glowGradient)" : "url(#neutralGradient)";
              
              return (
                <G key={`path-${idx}`}>
                  {/* Outer glow for current path */}
                  {isCurrent && (
                    <Path
                      d={pathData}
                      stroke="rgba(245, 158, 11, 0.3)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                    />
                  )}
                  
                  {/* Shadow path */}
                  <Path
                    d={pathData}
                    stroke="rgba(0, 0, 0, 0.15)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    transform="translate(1, 3)"
                  />
                  
                  {/* Main chart line path */}
                  <Path
                    d={pathData}
                    stroke={strokeGradient}
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={isPathCompleted ? "0" : "12 6"}
                    opacity={isPathCompleted ? 1 : 0.8}
                  />
                  
                  {/* Stock market price points */}
                  <Circle
                    cx={startX}
                    cy={startY}
                    r="4"
                    fill={isPathCompleted ? "#00C896" : isCurrent ? "#F59E0B" : "#3B82F6"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  
                  {/* End point */}
                  <Circle
                    cx={endX}
                    cy={endY}
                    r="4"
                    fill={isPathCompleted ? "#00C896" : isCurrent ? "#F59E0B" : "#94A3B8"}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  
                  {/* Animated growth indicator for completed paths */}
                  {isPathCompleted && (
                    <G>
                      <Circle
                        cx={startX + (endX - startX) * 0.3}
                        cy={startY + (endY - startY) * 0.3}
                        r="2"
                        fill="#00C896"
                        opacity="0.8"
                      />
                      <Circle
                        cx={startX + (endX - startX) * 0.7}
                        cy={startY + (endY - startY) * 0.7}
                        r="2"
                        fill="#00C896"
                        opacity="0.6"
                      />
                    </G>
                  )}
                </G>
              );
            })}
          </Svg>
          {allLessons.map((lessonData, idx) => {
            const { lesson, step } = lessonData;
            const { completed, current, unlocked } = lessonStatuses[idx];
            const position = idx % 2 === 0 ? 'left' : 'right';
            const nodeStyle = {
              position: 'absolute' as const,
              left: nodePositions[idx].x - CIRCLE_SIZE / 2,
              top: nodePositions[idx].y,
              alignItems: 'center' as const,
            };
            
            // Check if this is the start of a new unit
            const isNewUnit = idx > 0 && lessonData.stepIdx !== allLessons[idx - 1].stepIdx;
            
            return (
              <React.Fragment key={lesson.id}>
                {/* Unit Divider */}
                {isNewUnit && (
                  <View style={[styles.unitDivider, { top: nodePositions[idx].y - 40 }]}>
                    <View style={styles.dividerLine} />
                    <View style={styles.dividerBadge}>
                      <Text style={styles.dividerText}>יחידה {step.step}</Text>
                    </View>
                    <View style={styles.dividerLine} />
                  </View>
                )}
                
                <View style={nodeStyle}>
                  <LessonNode
                    title={lesson.title}
                    unlocked={unlocked}
                    onStart={() => {
                      setSelectedLesson(step);
                      setModalVisible(true);
                    }}
                    showConnector={idx < allLessons.length - 1}
                    completed={completed}
                    current={current}
                    position={position}
                    lessonType={lesson.lessonType || 'info'}
                  />
                </View>
              </React.Fragment>
            );
          })}
          {/* Beautiful Enhanced Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="none"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <Animated.View style={[
                    styles.modalContent,
                    {
                      transform: [{ scale: modalVisible ? 1 : 0.9 }],
                      opacity: modalVisible ? 1 : 0,
                    }
                  ]}>
                    {/* Elegant Modal Header with Icon */}
                    <View style={styles.modalHeader}>
                      <View style={styles.modalIconContainer}>
                        <View style={styles.modalIconCircle}>
                          {selectedLesson?.lessons[0]?.lessonType === 'info' && <InfoIcon size={24} />}
                          {selectedLesson?.lessons[0]?.lessonType === 'memorize' && <MemorizeIcon size={24} />}
                          {selectedLesson?.lessons[0]?.lessonType === 'practice' && <PracticeIcon size={24} />}
                          {selectedLesson?.lessons[0]?.lessonType === 'test' && <TestIcon size={24} />}
                        </View>
                      </View>
                      <View style={styles.modalHeaderText}>
                        <Text style={styles.modalTitle}>
                          {selectedLesson?.step === 1 ? 'יחידה 1: ניתוח טכני' : 'יחידה 2: מניות ומסחר'}
                        </Text>
                        <Text style={styles.modalSubtitle}>
                          {selectedLesson?.lessons?.length || 0} שיעורים • {selectedLesson?.step === 1 ? 'קורס בסיסי' : 'קורס מתקדם'}
                        </Text>
                      </View>
                      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalCloseButton}>
                          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path d="M18 6L6 18M6 6l12 12" stroke="#64748B" strokeWidth={2} strokeLinecap="round"/>
                          </Svg>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                    
                    {/* Compact Progress */}
                    <View style={styles.modalProgress}>
                      <ProgressBarSVG 
                        progress={
                          selectedLesson?.lessons ? 
                          selectedLesson.lessons.filter((l: any) => completedLessons.includes(l.id)).length / selectedLesson.lessons.length 
                          : 0
                        } 
                        width={280} 
                      />
                    </View>

                    {/* Lessons List */}
                    <View style={styles.modalLessonsList}>
                      {selectedLesson?.lessons?.map((lesson: any, idx: number) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isCurrent = !isCompleted && selectedLesson.lessons.slice(0, idx).every((l: any) => completedLessons.includes(l.id));
                        
                        return (
                          <View key={lesson.id} style={[
                            styles.modalLessonItem,
                            isCompleted && styles.modalLessonCompleted,
                            isCurrent && styles.modalLessonCurrent
                          ]}>
                            <View style={styles.modalLessonIcon}>
                              {isCompleted ? (
                                <Text style={styles.checkmark}>✓</Text>
                              ) : isCurrent ? (
                                <Text style={styles.currentDot}>●</Text>
                              ) : (
                                <Text style={styles.lockedDot}>○</Text>
                              )}
                            </View>
                            <Text style={[
                              styles.modalLessonText,
                              isCompleted && styles.modalLessonTextCompleted,
                              isCurrent && styles.modalLessonTextCurrent
                            ]}>
                              שיעור {idx + 1}: {lesson.title || `שיעור ${idx + 1}`}
                            </Text>
                            {isCompleted && <XPStarSVG size={16} />}
                          </View>
                        );
                      })}
                    </View>

                    {/* Action Button */}
                    {(() => {
                      const nextLesson = selectedLesson?.lessons?.find((l: any) => !completedLessons.includes(l.id));
                      if (!nextLesson) {
                        return (
                          <View style={styles.modalCompletedButton}>
                            <Text style={styles.modalCompletedText}>🎉 יחידה הושלמה!</Text>
                          </View>
                        );
                      }
                      const lessonIndex = selectedLesson.lessons.findIndex((l: any) => l.id === nextLesson.id);
                      return (
                        <Pressable
                          style={styles.modalActionButton}
                          onPress={() => handleLessonStart(nextLesson.id)}
                        >
                          <Text style={styles.modalActionText}>
                            התחל שיעור {lessonIndex + 1}
                          </Text>
                        </Pressable>
                      );
                    })()}
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          {/* Spacer for scroll */}
          <View style={{ height: 200 }} />
        </View>
      </ScrollView>
      <BottomNavbar activeTab="map" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  scrollContent: {
    paddingBottom: 200, // Increased padding for better scroll
    flexGrow: 1, // Allow content to expand
  },
  
  // Elegant Hero Section
  heroSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 0,
    marginBottom: 32,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  unitHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  unitBadge: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  
  unitBadgeText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: '#4F46E5',
    letterSpacing: 0.5,
  },
  
  unitTitle: {
    fontSize: 28,
    fontFamily: theme.font.bold,
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  
  unitSubtitle: {
    fontSize: 16,
    fontFamily: theme.font.family,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  
  progressContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  progressText: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: '#475569',
    flex: 1,
    textAlign: 'right',
  },
  
  progressPercentage: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: '#0EA5E9',
    marginLeft: 12,
  },
  
  progressBar: {
    alignItems: 'center',
  },
  
  // Sticky Minimal Header Styles
  stickyHeader: {
    position: 'absolute',
    top: 90, // Position below TopBar (assuming TopBar height is ~90px)
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  
  stickyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  stickyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  stickyBadge: {
    backgroundColor: '#EFF6FF',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  
  stickyBadgeText: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: '#0EA5E9',
  },
  
  stickyTitle: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  
  stickyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  stickyProgress: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: '#0EA5E9',
    marginRight: 8,
    minWidth: 35,
    textAlign: 'right',
  },
  
  miniProgressBar: {
    alignItems: 'center',
  },
  
  // Elegant Map Container
  mapContainer: {
    width: SCREEN_WIDTH,
    minHeight: 2000, // Increased to accommodate all lessons
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    paddingBottom: 120, // More bottom padding for better scroll
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  
  // Unit Divider Styles
  unitDivider: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
  },
  
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  
  dividerBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  dividerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: theme.font.bold,
    textAlign: 'center',
  },
  
  // Refined Footprint Styles
  footprintContainer: {
    position: 'absolute',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Professional Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    marginRight: 16,
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  modalHeaderText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'left',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: '#64748B',
    textAlign: 'left',
  },
  modalProgress: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalLessonsList: {
    marginBottom: 24,
  },
  modalLessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#FAFBFF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalLessonCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  modalLessonCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  modalLessonIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
  },
  currentDot: {
    fontSize: 16,
    color: '#0EA5E9',
  },
  lockedDot: {
    fontSize: 16,
    color: '#94A3B8',
  },
  modalLessonText: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.font.family,
    color: '#334155',
    textAlign: 'right',
    lineHeight: 20,
  },
  modalLessonTextCompleted: {
    color: '#059669',
    fontFamily: theme.font.bold,
  },
  modalLessonTextCurrent: {
    color: '#0EA5E9',
    fontFamily: theme.font.bold,
  },
  modalActionButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  modalActionText: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  modalCompletedButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalCompletedText: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
