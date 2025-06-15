import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { AppText } from "../../../App";
import theme from "../../theme";
import Svg, { Path } from 'react-native-svg';

export const CIRCLE_SIZE = 96;

interface LessonNodeProps {
  title: string;
  unlocked: boolean;
  onStart: () => void;
  showConnector?: boolean;
  completed?: boolean;
  current?: boolean;
  position?: 'left' | 'right';
}

// Character icon placeholder (circle with face)
const CharacterIcon = () => (
  <View style={styles.iconCircle}>
    {/* Replace with your character SVG/image if needed */}
    <Svg width={44} height={44} viewBox="0 0 40 40" fill="none">
      <Path d="M20 2C10.6 2 2.9 9.7 2.9 19.1c0 9.4 7.7 17.1 17.1 17.1s17.1-7.7 17.1-17.1C37.1 9.7 29.4 2 20 2z" fill="#5EDB5E"/>
      <Path d="M20 36c-8.8 0-16-7.2-16-16S11.2 4 20 4s16 7.2 16 16-7.2 16-16 16z" fill="#fff" fillOpacity={0.2}/>
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

export default function LessonNode({
  title,
  unlocked,
  onStart,
  showConnector,
  completed = false,
  current = false,
  position = 'left',
}: LessonNodeProps) {
  // Offset for zig-zag
  const offsetStyle = position === 'left' ? styles.left : styles.right;
  return (
    <View style={[styles.container, offsetStyle]}>
      <View style={styles.pathLine} />
      <TouchableOpacity
        style={[styles.circle, completed && styles.completed, current && styles.current, !unlocked && styles.locked]}
        activeOpacity={unlocked ? 0.7 : 1}
        onPress={unlocked ? onStart : undefined}
        disabled={!unlocked}
      >
        <CharacterIcon />
        <AppText style={styles.title} numberOfLines={2} ellipsizeMode="tail">{title}</AppText>
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
    borderColor: theme.colors.primaryBlue,
    marginBottom: 0,
    zIndex: 1,
    padding: 0,
  },
  completed: {
    borderColor: theme.colors.growthGreen,
    backgroundColor: theme.colors.growthGreenLight,
  },
  current: {
    borderColor: theme.colors.primaryBlue,
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
    backgroundColor: theme.colors.growthGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
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
