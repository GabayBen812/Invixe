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

function FlameBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="bg" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#1C1007" />
          <Stop offset="50%" stopColor="#2E1500" />
          <Stop offset="100%" stopColor="#0A0400" />
        </LinearGradient>
        <LinearGradient id="f1" x1="0.5" y1="1" x2="0.5" y2="0">
          <Stop offset="0%" stopColor="#C44D00" />
          <Stop offset="60%" stopColor="#F06000" />
          <Stop offset="100%" stopColor="#FFA040" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="f2" x1="0.5" y1="1" x2="0.5" y2="0">
          <Stop offset="0%" stopColor="#FF8C00" />
          <Stop offset="70%" stopColor="#FFC040" />
          <Stop offset="100%" stopColor="#FFE080" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="f3" x1="0.5" y1="1" x2="0.5" y2="0">
          <Stop offset="0%" stopColor="#FFB800" />
          <Stop offset="100%" stopColor="#FFF0A0" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />

      {/* Embers */}
      {[
        { cx: "12%", cy: "30%", r: 1.8, o: 0.45 },
        { cx: "28%", cy: "15%", r: 1.4, o: 0.35 },
        { cx: "50%", cy: "22%", r: 2.0, o: 0.5 },
        { cx: "70%", cy: "12%", r: 1.6, o: 0.4 },
        { cx: "85%", cy: "28%", r: 1.3, o: 0.3 },
        { cx: "93%", cy: "18%", r: 1.8, o: 0.42 },
        { cx: "7%",  cy: "55%", r: 1.2, o: 0.28 },
        { cx: "40%", cy: "40%", r: 1.5, o: 0.38 },
      ].map((e, i) => (
        <Circle key={i} cx={e.cx} cy={e.cy} r={e.r} fill="#FF9020" opacity={e.o} />
      ))}

      {/* Wide base flame */}
      <Path
        d="M-5 100 C10 72, 28 85, 50 70 C72 85, 90 72, 105 100 Z"
        fill="url(#f1)"
        opacity={0.8}
      />
      {/* Left tongue */}
      <Path
        d="M-5 100 C5 78, 16 88, 28 76 C34 88, 42 94, 50 100 Z"
        fill="url(#f1)"
        opacity={0.7}
      />
      {/* Right tongue */}
      <Path
        d="M50 100 C58 90, 66 80, 72 68 C80 80, 90 88, 105 100 Z"
        fill="url(#f1)"
        opacity={0.7}
      />
      {/* Centre flame */}
      <Path
        d="M25 100 C32 78, 42 86, 50 62 C58 86, 68 78, 75 100 Z"
        fill="url(#f2)"
        opacity={0.85}
      />
      {/* Inner hot core */}
      <Path
        d="M38 100 C42 84, 47 88, 50 74 C53 88, 58 84, 62 100 Z"
        fill="url(#f3)"
        opacity={0.9}
      />
    </Svg>
  );
}

function ContinueChevron({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <Svg width={10} height={16} viewBox="0 0 10 16" fill="none">
      <Path
        d="M8 2L2 8L8 14"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ZeroStreakCard({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.zeroCard}>
      <View style={styles.zeroIconWrap}>
        <Text style={styles.zeroIcon}>🔥</Text>
      </View>
      <View style={styles.zeroTextCol}>
        <Text style={styles.zeroTitle}>עדיין אין רצף</Text>
        <Text style={styles.zeroSubtitle}>השלם שיעור היום כדי להתחיל</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.zeroButton, pressed && styles.buttonPressed]}
        onPress={onContinue}
      >
        <Text style={styles.zeroButtonText}>התחל</Text>
        <ContinueChevron color={theme.colors.primary[500]} />
      </Pressable>
    </View>
  );
}

export default function ProfileStreakCard({
  streakDays,
  nextLessonTitle,
  nextLessonDuration = "3 דק׳",
  onContinue,
}: Props) {
  if (streakDays === 0) {
    return <ZeroStreakCard onContinue={onContinue} />;
  }

  const subtitle = nextLessonTitle
    ? `השיעור הבא: ${nextLessonTitle} · ${nextLessonDuration}`
    : "סיימת את כל השיעורים!";

  return (
    <View style={styles.fireCard}>
      <FlameBackground />
      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [styles.fireButton, pressed && styles.buttonPressed]}
          onPress={onContinue}
        >
          <Text style={styles.fireButtonText}>המשך</Text>
          <ContinueChevron />
        </Pressable>

        <View style={styles.textCol}>
          <View style={styles.streakRow}>
            <Text style={styles.streakDaysWord}>ימים 🔥</Text>
            <Text style={styles.streakNumber}>{streakDays}</Text>
            <Text style={styles.streakLabel}>רצף: </Text>
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
  /* ── 0-streak card ── */
  zeroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    shadowColor: "#0F2233",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  zeroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  zeroIcon: {
    fontSize: 24,
    opacity: 0.35,
  },
  zeroTextCol: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },
  zeroTitle: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[700],
    textAlign: "right",
  },
  zeroSubtitle: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "right",
  },
  zeroButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexShrink: 0,
  },
  zeroButtonText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
  },

  /* ── 1+-streak fire card ── */
  fireCard: {
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
    color: "rgba(255,255,255,0.85)",
    lineHeight: 28,
  },
  streakNumber: {
    fontSize: 36,
    fontFamily: theme.font.bold,
    color: "#FFD060",
    lineHeight: 38,
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
    fontSize: 13,
    fontFamily: theme.font.family,
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
    lineHeight: 19,
  },
  fireButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexShrink: 0,
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fireButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: theme.font.bold,
  },

  /* ── shared ── */
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
});
