import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  LOADING_QUOTES,
  quoteIndexForLesson,
} from "../../data/loadingQuotes";
import theme, { colors, font } from "../../theme";

const QUOTE_ROTATE_MS = 9000;

type Props = {
  lessonId: number;
  lessonTitle: string;
  statusText: string;
  progress: number;
  isPractice?: boolean;
};

function QuoteMarkIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={14} viewBox="0 0 18 14" fill="none">
      <Path
        d="M0 14V8.4C0 5.04 1.26 2.52 3.78 0.84L5.88 3.36C4.2 4.48 3.36 5.88 3.36 7.56H6.3V14H0ZM11.7 14V8.4C11.7 5.04 12.96 2.52 15.48 0.84L17.58 3.36C15.9 4.48 15.06 5.88 15.06 7.56H18V14H11.7Z"
        fill={color}
      />
    </Svg>
  );
}

export function LessonLoadingView({
  lessonId,
  lessonTitle,
  statusText,
  progress,
  isPractice = false,
}: Props) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(1)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const [quoteOffset, setQuoteOffset] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  const palette = isPractice
    ? {
        card: colors.surface.darkRaised,
        cardBorder: colors.border.darkSubtle,
        title: colors.white,
        muted: "rgba(255,255,255,0.62)",
        status: "rgba(255,255,255,0.78)",
        pillBg: "rgba(118,215,97,0.16)",
        pillText: "#76D761",
        track: colors.progress.darkEmpty,
        fill: "#76D761",
        percent: "#76D761",
        quoteBg: colors.surface.darkChrome,
        quoteIconBg: "rgba(118,215,97,0.2)",
        quoteIcon: "#76D761",
        quoteText: "rgba(255,255,255,0.9)",
        author: "#76D761",
        shadow: "#000000",
        disclaimer: "rgba(255,255,255,0.45)",
      }
    : {
        card: colors.surface.card,
        cardBorder: colors.border.subtle,
        title: colors.neutral[900],
        muted: colors.neutral[500],
        status: colors.neutral[700],
        pillBg: colors.info[100],
        pillText: colors.primary[500],
        track: colors.progress.empty,
        fill: colors.progress.filled,
        percent: colors.primary[500],
        quoteBg: colors.surface.card,
        quoteIconBg: colors.info[100],
        quoteIcon: colors.primary[400],
        quoteText: colors.neutral[700],
        author: colors.primary[500],
        shadow: colors.neutral[900],
        disclaimer: colors.neutral[400],
      };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(Math.max(progress, 0), 1),
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  useEffect(() => {
    const id = setInterval(() => {
      setDotCount((c) => (c + 1) % 4);
    }, 450);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(quoteOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        setQuoteOffset((o) => o + 1);
        Animated.timing(quoteOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }, QUOTE_ROTATE_MS);
    return () => clearInterval(id);
  }, [quoteOpacity]);

  const quote =
    LOADING_QUOTES[quoteIndexForLesson(lessonId, quoteOffset)] ??
    LOADING_QUOTES[0];

  const percentLabel = `${Math.round(Math.min(Math.max(progress, 0), 1) * 100)}%`;
  const dots = ".".repeat(dotCount);
  const cardScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.012],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.mainCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.cardBorder,
              shadowColor: palette.shadow,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <View style={[styles.pill, { backgroundColor: palette.pillBg }]}>
            <Text style={[styles.pillText, { color: palette.pillText }]}>
              טוען שיעור
            </Text>
          </View>

          <Text style={[styles.title, { color: palette.title }]} numberOfLines={2}>
            {lessonTitle}
          </Text>

          <Text style={[styles.status, { color: palette.status }]}>
            {statusText}
            {dots}
          </Text>

          <View style={styles.progressRow}>
            <View style={[styles.progressTrack, { backgroundColor: palette.track }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: palette.fill, width: progressWidth },
                ]}
              />
            </View>
            <Text style={[styles.percent, { color: palette.percent }]}>
              {percentLabel}
            </Text>
          </View>

          <Text style={[styles.hint, { color: palette.muted }]}>
            רגע קטן — מכינים הכל בשבילך
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.quoteCard,
            {
              backgroundColor: palette.quoteBg,
              borderColor: palette.cardBorder,
              opacity: quoteOpacity,
            },
          ]}
        >
          <View
            style={[
              styles.quoteIconWrap,
              { backgroundColor: palette.quoteIconBg },
            ]}
          >
            <QuoteMarkIcon color={palette.quoteIcon} />
          </View>
          <Text style={[styles.quoteText, { color: palette.quoteText }]}>
            {quote.text}
          </Text>
          <Text style={[styles.quoteAuthor, { color: palette.author }]}>
            — {quote.author}
          </Text>
        </Animated.View>
      </View>

      <Text style={[styles.disclaimer, { color: palette.disclaimer }]}>
        התוכן לימודי בלבד ואינו ייעוץ פיננסי
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  mainCard: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  pillText: {
    fontFamily: font.bold,
    fontSize: 13,
  },
  title: {
    fontFamily: font.bold,
    fontSize: 26,
    lineHeight: 32,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 10,
  },
  status: {
    fontFamily: font.family,
    fontSize: 15,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 18,
    minHeight: 22,
  },
  progressRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  percent: {
    fontFamily: font.bold,
    fontSize: 14,
    minWidth: 40,
    textAlign: "left",
  },
  hint: {
    fontFamily: font.family,
    fontSize: 13,
    textAlign: "right",
    writingDirection: "rtl",
  },
  quoteCard: {
    marginTop: 16,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: "center",
  },
  quoteIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quoteText: {
    fontFamily: font.family,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    writingDirection: "rtl",
    marginBottom: 10,
  },
  quoteAuthor: {
    fontFamily: font.bold,
    fontSize: 13,
    textAlign: "right",
    writingDirection: "rtl",
    alignSelf: "stretch",
  },
  disclaimer: {
    fontFamily: font.family,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    writingDirection: "rtl",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
});
