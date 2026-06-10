import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
} from "react-native-svg";
import theme from "../../theme";

type Props = {
  streakDays: number;
  nextLessonTitle?: string;
  nextLessonDuration?: string;
  onContinue: () => void;
};

const EMBERS = [
  { x: "8%", y: "18%", r: 2.2, o: 0.55 },
  { x: "22%", y: "42%", r: 1.6, o: 0.4 },
  { x: "38%", y: "24%", r: 2, o: 0.5 },
  { x: "52%", y: "55%", r: 1.4, o: 0.35 },
  { x: "64%", y: "20%", r: 2.4, o: 0.6 },
  { x: "78%", y: "38%", r: 1.8, o: 0.45 },
  { x: "88%", y: "16%", r: 2, o: 0.5 },
  { x: "92%", y: "48%", r: 1.5, o: 0.38 },
  { x: "14%", y: "62%", r: 1.3, o: 0.3 },
  { x: "46%", y: "12%", r: 1.7, o: 0.42 },
];

function StreakCardBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="streakBg" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#1A1412" />
          <Stop offset="42%" stopColor="#3A2118" />
          <Stop offset="100%" stopColor="#0E0806" />
        </LinearGradient>
        <LinearGradient id="flameOuter" x1="0.5" y1="1" x2="0.5" y2="0">
          <Stop offset="0%" stopColor="#E85D04" />
          <Stop offset="55%" stopColor="#F48C06" />
          <Stop offset="100%" stopColor="#FFBA08" stopOpacity={0.2} />
        </LinearGradient>
        <LinearGradient id="flameInner" x1="0.5" y1="1" x2="0.5" y2="0">
          <Stop offset="0%" stopColor="#FFBA08" />
          <Stop offset="100%" stopColor="#FFF3BF" stopOpacity={0.85} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#streakBg)" />
      {EMBERS.map((ember, i) => (
        <Circle
          key={i}
          cx={ember.x}
          cy={ember.y}
          r={ember.r}
          fill="#F79009"
          opacity={ember.o}
        />
      ))}
      {/* Bottom flames */}
      <Path
        d="M-8 88 C18 62, 28 78, 44 88 C58 72, 72 82, 88 88 L88 100 L-8 100 Z"
        fill="url(#flameOuter)"
        opacity={0.75}
      />
      <Path
        d="M28 88 C38 68, 48 76, 58 88 C66 74, 76 80, 86 88 L86 100 L28 100 Z"
        fill="url(#flameOuter)"
        opacity={0.9}
      />
      <Path
        d="M0 92 C14 74, 24 84, 36 92 C48 78, 60 88, 76 92 L76 100 L0 100 Z"
        fill="url(#flameOuter)"
        opacity={0.55}
      />
      <Path
        d="M40 90 C46 78, 52 82, 58 90 C62 82, 68 86, 74 90 L74 100 L40 100 Z"
        fill="url(#flameInner)"
        opacity={0.85}
      />
      <Path
        d="M52 92 C56 84, 60 86, 64 92 C66 88, 70 90, 74 92 L74 100 L52 100 Z"
        fill="url(#flameInner)"
        opacity={0.7}
      />
    </Svg>
  );
}

function ContinueChevron() {
  return (
    <Svg width={10} height={16} viewBox="0 0 10 16" fill="none">
      <Path
        d="M8 2L2 8L8 14"
        stroke="#FFFFFF"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ProfileStreakCard({
  streakDays,
  nextLessonTitle,
  nextLessonDuration = "3 דק׳",
  onContinue,
}: Props) {
  const subtitle = nextLessonTitle
    ? `השיעור הבא: ${nextLessonTitle} • ${nextLessonDuration}`
    : "סיימת את כל השיעורים!";

  return (
    <View style={styles.card}>
      <StreakCardBackground />
      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onContinue}
        >
          <Text style={styles.buttonText}>המשך</Text>
          <ContinueChevron />
        </Pressable>

        <View style={styles.textCol}>
          <View style={styles.streakRow}>
            <Text style={styles.streakDaysWord}>ימים</Text>
            <Text style={styles.streakNumber}>{streakDays}</Text>
            <Text style={styles.streakLabel}>רצף חם: </Text>
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: "hidden",
    minHeight: 124,
    marginBottom: 12,
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 14,
    zIndex: 1,
  },
  textCol: {
    flex: 1,
    alignItems: "flex-end",
    gap: 6,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  streakLabel: {
    fontSize: 17,
    fontFamily: theme.font.family,
    color: "#FFFFFF",
    lineHeight: 28,
  },
  streakNumber: {
    fontSize: 34,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
    lineHeight: 36,
    letterSpacing: -0.5,
    marginLeft: 4,
  },
  streakDaysWord: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
    lineHeight: 28,
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: "rgba(255,255,255,0.82)",
    textAlign: "right",
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primaryBlue,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexShrink: 0,
    shadowColor: theme.colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: theme.font.bold,
  },
});
