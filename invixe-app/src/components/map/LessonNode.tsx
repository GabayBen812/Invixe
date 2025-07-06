import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "../../../App";
import theme from "../../theme";
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export const CIRCLE_SIZE = 96;

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

// Info lesson icon (book)
const InfoIcon = () => (
  <View style={[styles.iconCircle, styles.infoIcon]}>
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  </View>
);

// Memorize lesson icon (brain)
const MemorizeIcon = () => (
  <View style={[styles.iconCircle, styles.memorizeIcon]}>
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-5 0v-15A2.5 2.5 0 019.5 2z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M20 4.5A2.5 2.5 0 0017.5 2h-3a2.5 2.5 0 00-2.5 2.5v15a2.5 2.5 0 002.5 2.5h3A2.5 2.5 0 0020 19.5v-15z" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  </View>
);

// Practice lesson icon (target)
const PracticeIcon = () => (
  <View style={[styles.iconCircle, styles.practiceIcon]}>
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth={2}/>
      <Circle cx="12" cy="12" r="6" stroke="#FFFFFF" strokeWidth={2}/>
      <Circle cx="12" cy="12" r="2" fill="#FFFFFF"/>
    </Svg>
  </View>
);

// Test lesson icon (checkmark in circle)
const TestIcon = () => (
  <View style={[styles.iconCircle, styles.testIcon]}>
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth={2}/>
      <Path d="M9 12l2 2 4-4" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  </View>
);

// Checkmark icon
const Checkmark = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M5 13l4 4L19 7" stroke="#5EDB5E" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Lock icon
const LockIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M6 11V8a6 6 0 1112 0v3" stroke="#B0BEC5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" stroke="#B0BEC5" strokeWidth={2}/>
    <Path d="M12 16v2" stroke="#B0BEC5" strokeWidth={2} strokeLinecap="round"/>
  </Svg>
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
  // Offset for zig-zag
  const offsetStyle = position === 'left' ? styles.left : styles.right;
  const lessonStyle = getLessonStyle(lessonType);
  
  return (
    <View style={[styles.container, offsetStyle]}>
      <View style={styles.pathLine} />
      <TouchableOpacity
        style={[
          styles.circle, 
          lessonStyle,
          completed && styles.completed, 
          current && styles.current, 
          !unlocked && styles.locked
        ]}
        activeOpacity={unlocked ? 0.7 : 1}
        onPress={unlocked ? onStart : undefined}
        disabled={!unlocked}
      >
        {getLessonIcon(lessonType)}
        {title ? (
          <AppText style={styles.title} numberOfLines={2} ellipsizeMode="tail">{title}</AppText>
        ) : null}
        {completed && <View style={styles.statusIcon}><Checkmark /></View>}
        {current && !completed && <View style={styles.statusIconGlow} />}
        {!unlocked && !completed && <View style={styles.statusIcon}><LockIcon /></View>}
      </TouchableOpacity>
      {showConnector && <View style={styles.connector} />}
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
  pathLine: {
    position: "absolute",
    top: 0,
    left: CIRCLE_SIZE / 2 - 2,
    width: 4,
    height: theme.spacing.xl,
    backgroundColor: theme.colors.primaryBlue,
    zIndex: 0,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: theme.colors.trustBlueDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 3,
    marginBottom: 0,
    zIndex: 1,
    padding: 0,
  },
  // Lesson type specific styles
  infoLesson: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F8FF',
  },
  memorizeLesson: {
    borderColor: '#7B68EE',
    backgroundColor: '#F8F4FF',
  },
  practiceLesson: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  testLesson: {
    borderColor: '#50C878',
    backgroundColor: '#F0FFF0',
  },
  completed: {
    borderColor: theme.colors.growthGreen,
    backgroundColor: theme.colors.growthGreenLight,
  },
  current: {
    shadowColor: theme.colors.primaryBlue,
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  locked: {
    borderColor: "#B0BEC5",
    backgroundColor: theme.colors.gray,
    opacity: 0.7,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  infoIcon: {
    backgroundColor: '#4A90E2',
  },
  memorizeIcon: {
    backgroundColor: '#7B68EE',
  },
  practiceIcon: {
    backgroundColor: '#FF6B6B',
  },
  testIcon: {
    backgroundColor: '#50C878',
  },
  title: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.trustBlue,
    textAlign: "center",
    marginTop: 2,
    maxWidth: 72,
  },
  statusIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  statusIconGlow: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryBlue,
    opacity: 0.2,
  },
  connector: {
    width: 4,
    height: theme.spacing.xl,
    backgroundColor: theme.colors.primaryBlue,
    marginTop: 0,
    zIndex: 0,
    alignSelf: 'center',
  },
});
