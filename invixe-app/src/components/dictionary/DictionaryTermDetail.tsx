import React, { useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from "react-native-svg";
import theme from "../../theme";
import type { DictionaryEntry } from "../../data/dictionary";
import { dictionaryTextRtl } from "./dictionaryRtl";

type Props = {
  entry: DictionaryEntry;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  position?: { current: number; total: number };
};

// Per-topic color palettes
const HERO_BG: Record<string, string> = {
  candles: "#FFF1E6",
  graphs: "#E8F4FF",
  "support-resistance": "#E8FBF2",
  indicators: "#F3EEFF",
  markets: "#FFFBE8",
};

const TOPIC_LABEL: Record<string, string> = {
  candles: "נרות",
  graphs: "גרפים",
  "support-resistance": "תמיכה והתנגדות",
  indicators: "מדדים",
  markets: "שווקים",
};

const PLACEHOLDER_GRAD: Record<string, [string, string]> = {
  candles: ["#FFA040", "#FF6B35"],
  graphs: ["#60B8FF", "#3372D8"],
  "support-resistance": ["#4ADBA5", "#12B76A"],
  indicators: ["#B57BFF", "#8B5CF6"],
  markets: ["#FFD060", "#F59E0B"],
  default: ["#93C5FD", "#3372D8"],
};

const DIRECTION_LABEL: Record<string, string> = {
  bullish: "שורי ↑",
  bearish: "דובי ↓",
  neutral: "ניטרלי",
};
const DIRECTION_COLOR: Record<string, string> = {
  bullish: theme.colors.growthGreen,
  bearish: theme.colors.error[600],
  neutral: theme.colors.neutral[500],
};
const DIRECTION_BG: Record<string, string> = {
  bullish: theme.colors.success[100],
  bearish: theme.colors.error[100],
  neutral: theme.colors.neutral[100],
};

const RELIABILITY_LABEL: Record<string, string> = {
  high: "גבוהה ★★★",
  medium: "בינונית ★★☆",
  low: "נמוכה ★☆☆",
};

const FREQUENCY_LABEL: Record<string, string> = {
  common: "שכיח",
  rare: "נדיר",
};

function HeroPlaceholder({
  topicId,
  letter,
}: {
  topicId: string;
  letter: string;
}) {
  const grad = PLACEHOLDER_GRAD[topicId] ?? PLACEHOLDER_GRAD.default;
  return (
    <>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="hpg" x1="0.15" y1="0.1" x2="0.85" y2="0.9">
            <Stop offset="0%" stopColor={grad[0]} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={grad[1]} stopOpacity={0.25} />
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#hpg)" />
      </Svg>
      <Text style={[styles.placeholderLetter, { color: grad[1] }]}>
        {letter}
      </Text>
    </>
  );
}

function InfoCard({
  label,
  value,
  valueColor,
  valueBg,
}: {
  label: string;
  value: string;
  valueColor?: string;
  valueBg?: string;
}) {
  return (
    <View style={[infoCard.wrap, valueBg && { backgroundColor: valueBg }]}>
      <Text
        style={[infoCard.value, valueColor && { color: valueColor }]}
      >
        {value}
      </Text>
      <Text style={infoCard.label}>{label}</Text>
    </View>
  );
}

const infoCard = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.surface.card,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignItems: "center",
    minWidth: 90,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  value: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "center",
  },
});

export default function DictionaryTermDetail({
  entry,
  onBack,
  onPrev,
  onNext,
  position,
}: Props) {
  const { width } = useWindowDimensions();
  const imageSize = Math.min(width - 64, 160);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  const ImageComponent = entry.imageComponent;
  const heroBg = HERO_BG[entry.topicId] ?? theme.colors.neutral[100];
  const topicLabel = TOPIC_LABEL[entry.topicId];

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [entry.id]);

  const infoItems = useMemo(() => {
    const items: {
      label: string;
      value: string;
      valueColor?: string;
      valueBg?: string;
    }[] = [];
    if (entry.direction) {
      items.push({
        label: "כיוון",
        value: DIRECTION_LABEL[entry.direction] ?? entry.direction,
        valueColor: DIRECTION_COLOR[entry.direction],
        valueBg: DIRECTION_BG[entry.direction],
      });
    }
    if (entry.reliability) {
      items.push({
        label: "אמינות",
        value: RELIABILITY_LABEL[entry.reliability] ?? entry.reliability,
      });
    }
    if (entry.frequency) {
      items.push({
        label: "תדירות",
        value: FREQUENCY_LABEL[entry.frequency] ?? entry.frequency,
      });
    }
    if (entry.appearsIn) {
      items.push({ label: "מופיע ב", value: entry.appearsIn });
    }
    return items;
  }, [entry]);

  const showNav = onPrev !== undefined || onNext !== undefined;

  return (
    <View style={styles.container}>
      {/* Back button */}
      <Pressable onPress={onBack} style={styles.backRow} hitSlop={10}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18L15 12L9 6"
            stroke={theme.colors.primary[500]}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={styles.backText}>חזרה לרשימה</Text>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero image area */}
          <View style={styles.heroOuter}>
            <View style={[styles.heroInner, { backgroundColor: heroBg }]}>
              {ImageComponent ? (
                <ImageComponent width={imageSize} height={imageSize} />
              ) : (
                <HeroPlaceholder
                  topicId={entry.topicId}
                  letter={entry.term.charAt(0)}
                />
              )}
            </View>
          </View>

          {/* Category + title */}
          <View style={styles.titleSection}>
            {topicLabel ? (
              <View style={styles.categoryRow}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{topicLabel}</Text>
                </View>
              </View>
            ) : null}
            <Text style={styles.title}>{entry.term}</Text>
          </View>

          {/* Info cards (only when metadata exists) */}
          {infoItems.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.infoRow}
              style={styles.infoScroll}
            >
              {infoItems.map((item, i) => (
                <InfoCard key={i} {...item} />
              ))}
            </ScrollView>
          )}

          {/* Description card */}
          <View style={styles.descCard}>
            <Text style={styles.descLabel}>הסבר</Text>
            <Text style={styles.descText}>{entry.explanation}</Text>
          </View>

          {/* Prev / Next navigation */}
          {showNav && (
            <View style={styles.navRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.navBtn,
                  !onPrev && styles.navBtnDisabled,
                  pressed && onPrev && styles.navBtnPressed,
                ]}
                onPress={onPrev}
                disabled={!onPrev}
              >
                <Text
                  style={[
                    styles.navBtnText,
                    !onPrev && styles.navBtnTextMuted,
                  ]}
                >
                  הקודם
                </Text>
              </Pressable>

              {position && (
                <Text style={styles.navPosition}>
                  {position.current} / {position.total}
                </Text>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.navBtn,
                  !onNext && styles.navBtnDisabled,
                  pressed && onNext && styles.navBtnPressed,
                ]}
                onPress={onNext}
                disabled={!onNext}
              >
                <Text
                  style={[
                    styles.navBtnText,
                    !onNext && styles.navBtnTextMuted,
                  ]}
                >
                  הבא
                </Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontFamily: theme.font.family,
    color: theme.colors.primary[500],
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Hero
  heroOuter: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 22,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heroInner: {
    height: 220,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  placeholderLetter: {
    fontSize: 88,
    fontFamily: theme.font.bold,
    opacity: 0.35,
  },

  // Category + title
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  categoryPillText: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    ...dictionaryTextRtl,
  },

  // Info cards
  infoScroll: {
    marginBottom: 16,
  },
  infoRow: {
    paddingHorizontal: 20,
    gap: 10,
  },

  // Description
  descCard: {
    marginHorizontal: 16,
    backgroundColor: theme.colors.surface.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  descLabel: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[400],
    textAlign: "right",
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  descText: {
    fontSize: 17,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[700],
    lineHeight: 29,
    ...dictionaryTextRtl,
  },

  // Navigation
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.card,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnPressed: {
    backgroundColor: theme.colors.neutral[100],
  },
  navBtnText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
  },
  navBtnTextMuted: {
    color: theme.colors.neutral[400],
  },
  navPosition: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
  },
});
