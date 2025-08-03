import React from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { AppText } from "../../../App";
import theme from "../../theme";
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

export const CIRCLE_SIZE = 80;

interface LessonNodeProps {
  title?: string;
  unlocked: boolean;
  onStart: () => void;
  showConnector?: boolean;
  completed?: boolean;
  current?: boolean;
  position?: 'left' | 'right';
  lessonType?: 'memorize' | 'info' | 'test' | 'practice';
}

// Stock Chart Analysis icon
const InfoIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="100%" stopColor="#E5E7EB" />
      </LinearGradient>
    </Defs>
    {/* Stock chart lines */}
    <Path d="M3 17L9 11L13 15L21 7" stroke="url(#chartGradient)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M21 7h-4v4" stroke="url(#chartGradient)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
    {/* Chart area */}
    <Rect x="2" y="3" width="20" height="18" rx="2" stroke="url(#chartGradient)" strokeWidth={1.5} fill="none"/>
    {/* Data points */}
    <Circle cx="9" cy="11" r="2" fill="url(#chartGradient)"/>
    <Circle cx="13" cy="15" r="2" fill="url(#chartGradient)"/>
  </Svg>
);

// Trading Patterns & Indicators icon
const MemorizeIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="patternGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="100%" stopColor="#F3F4F6" />
      </LinearGradient>
    </Defs>
    {/* Candlestick patterns */}
    <Rect x="4" y="8" width="3" height="8" fill="url(#patternGradient)" rx="1"/>
    <Rect x="8.5" y="6" width="3" height="10" fill="url(#patternGradient)" rx="1"/>
    <Rect x="13" y="9" width="3" height="6" fill="url(#patternGradient)" rx="1"/>
    <Rect x="17.5" y="5" width="3" height="12" fill="url(#patternGradient)" rx="1"/>
    {/* Trend lines */}
    <Path d="M2 20L6 16L11 12L16 8L22 4" stroke="url(#patternGradient)" strokeWidth={2} strokeLinecap="round" strokeDasharray="3 2"/>
  </Svg>
);

// Portfolio Management & Trading Practice icon
const PracticeIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="portfolioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="100%" stopColor="#F9FAFB" />
      </LinearGradient>
    </Defs>
    {/* Portfolio pie chart */}
    <Circle cx="12" cy="12" r="8" stroke="url(#portfolioGradient)" strokeWidth={2} fill="none"/>
    <Path d="M12 4 A8 8 0 0 1 17.66 8" stroke="url(#portfolioGradient)" strokeWidth={3} strokeLinecap="round"/>
    <Path d="M17.66 8 A8 8 0 0 1 17.66 16" stroke="url(#portfolioGradient)" strokeWidth={2} strokeLinecap="round"/>
    <Path d="M17.66 16 A8 8 0 0 1 12 20" stroke="url(#portfolioGradient)" strokeWidth={2} strokeLinecap="round"/>
    {/* Dollar sign in center */}
    <SvgText x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="url(#portfolioGradient)">$</SvgText>
  </Svg>
);

// Market Assessment & Trading Test icon
const TestIcon = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="assessmentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="100%" stopColor="#F0FDF4" />
      </LinearGradient>
    </Defs>
    {/* Trading screen/monitor */}
    <Rect x="3" y="4" width="18" height="13" rx="2" stroke="url(#assessmentGradient)" strokeWidth={2} fill="none"/>
    {/* Profit line */}
    <Path d="M6 12L9 9L13 11L18 6" stroke="url(#assessmentGradient)" strokeWidth={2.5} strokeLinecap="round"/>
    {/* Success checkmark */}
    <Path d="M8 20l2 2 4-4" stroke="url(#assessmentGradient)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
    {/* Performance indicators */}
    <Circle cx="15" cy="9" r="1.5" fill="url(#assessmentGradient)"/>
    <Circle cx="9" cy="11" r="1.5" fill="url(#assessmentGradient)"/>
  </Svg>
);

// Checkmark icon with glow effect
const Checkmark = () => (
  <View style={styles.checkmarkContainer}>
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  </View>
);

// Lock icon with modern styling
const LockIcon = () => (
  <View style={styles.lockContainer}>
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 11V8a6 6 0 1112 0v3" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" stroke="#FFFFFF" strokeWidth={2.5}/>
    </Svg>
  </View>
);

const getLessonIcon = (lessonType: 'memorize' | 'info' | 'test' | 'practice') => {
  switch (lessonType) {
    case 'info':
      return <InfoIcon />;
    case 'memorize':
      return <MemorizeIcon />;
    case 'practice':
      return <PracticeIcon />;
    case 'test':
      return <TestIcon />;
    default:
      return <InfoIcon />;
  }
};

const getLessonStyle = (lessonType: 'memorize' | 'info' | 'test' | 'practice') => {
  switch (lessonType) {
    case 'info':
      return styles.infoLesson;
    case 'memorize':
      return styles.memorizeLesson;
    case 'practice':
      return styles.practiceLesson;
    case 'test':
      return styles.testLesson;
    default:
      return styles.infoLesson;
  }
};

export default function LessonNode({
  title,
  unlocked,
  onStart,
  showConnector,
  completed = false,
  current = false,
  position = 'left',
  lessonType = 'info',
}: LessonNodeProps) {
  const [scaleAnim] = React.useState(new Animated.Value(1));
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [slideAnim] = React.useState(new Animated.Value(50));
  
  // Offset for zig-zag
  const offsetStyle = position === 'left' ? styles.left : styles.right;
  const lessonStyle = getLessonStyle(lessonType);
  
  // Entrance animation on mount
  React.useEffect(() => {
    Animated.sequence([
      Animated.delay(Math.random() * 500), // Random stagger
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);
  
  const handlePressIn = () => {
    if (unlocked) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (unlocked) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  };
  
  return (
    <View style={[styles.container, offsetStyle]}>
      <Animated.View style={[{ 
        transform: [
          { scale: scaleAnim },
          { translateY: slideAnim }
        ],
        opacity: fadeAnim 
      }]}>
        <TouchableOpacity
          style={[
            styles.circle, 
            lessonStyle,
            completed && styles.completed, 
            current && styles.current, 
            !unlocked && styles.locked
          ]}
          activeOpacity={1}
          onPress={unlocked ? onStart : undefined}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!unlocked}
        >
          {/* Stock Market Background Pattern */}
          <Svg style={styles.backgroundPattern} width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox="0 0 80 80">
            <Defs>
              <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={completed ? "#059669" : current ? "#F59E0B" : !unlocked ? "#64748B" : "#3B82F6"} stopOpacity="0.1" />
                <Stop offset="100%" stopColor={completed ? "#047857" : current ? "#D97706" : !unlocked ? "#475569" : "#1D4ED8"} stopOpacity="0.05" />
              </LinearGradient>
            </Defs>
            {/* Subtle grid pattern like trading charts */}
            <Path d="M0 20H80M0 40H80M0 60H80M20 0V80M40 0V80M60 0V80" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            {/* Mini chart pattern */}
            <Path d="M10 50L20 45L30 55L40 35L50 40L60 30L70 35" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none"/>
            <Rect width="80" height="80" fill="url(#bgGradient)" rx="40"/>
          </Svg>

          {/* Glassmorphism overlay with stock market theme */}
          <View style={[
            styles.glassOverlay, 
            completed && styles.completedGlass, 
            current && styles.currentGlass,
            !unlocked && styles.lockedGlass
          ]} />
          
          {/* Outer glow for current node - enhanced */}
          {current && <View style={styles.outerGlow} />}
          
          {/* Stock market performance indicator */}
          {completed && (
            <View style={styles.performanceIndicator}>
              <Svg width={12} height={12} viewBox="0 0 12 12">
                <Path d="M2 8L4 6L6 7L10 3" stroke="#00C896" strokeWidth={1.5} strokeLinecap="round"/>
                <Circle cx="10" cy="3" r="1" fill="#00C896"/>
              </Svg>
            </View>
          )}
          
          {/* Icon container with enhanced styling */}
          <View style={styles.iconContainer}>
            {getLessonIcon(lessonType)}
          </View>
          
          {/* Status indicators */}
          {completed && <Checkmark />}
          {current && !completed && <View style={styles.currentIndicator} />}
          {!unlocked && !completed && <LockIcon />}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  left: {
    alignItems: 'flex-start',
    marginLeft: 0,
  },
  right: {
    alignItems: 'flex-end',
    marginRight: 0,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    zIndex: 1,
  },
  
  // Stock market background pattern
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  
  // Enhanced glassmorphism overlay
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  
  completedGlass: {
    backgroundColor: 'rgba(0, 200, 150, 0.15)',
    borderColor: 'rgba(0, 200, 150, 0.4)',
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  
  currentGlass: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  
  lockedGlass: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  
  // Enhanced stock market themed lesson styles with better contrast
  infoLesson: {
    backgroundColor: '#1E40AF', // Deeper market analysis blue for better contrast
  },
  memorizeLesson: {
    backgroundColor: '#C2410C', // Changed to vibrant orange for better visibility  
  },
  practiceLesson: {
    backgroundColor: '#DC2626', // Changed to strong red for practice lessons
  },
  testLesson: {
    backgroundColor: '#059669', // Deeper profit green
  },
  
  completed: {
    backgroundColor: '#047857', // Strong bullish green
  },
  
  current: {
    shadowColor: '#F59E0B',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  
  locked: {
    backgroundColor: '#475569', // Darker neutral gray for better contrast
  },
  
  // Outer glow for current node
  outerGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: (CIRCLE_SIZE + 16) / 2,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    zIndex: -1,
  },
  
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  
  // Stock market performance indicator
  performanceIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 200, 150, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Status indicator styles
  checkmarkContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  lockContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  currentIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
