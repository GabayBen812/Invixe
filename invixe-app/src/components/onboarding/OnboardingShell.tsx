import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import PageBackground from "../ui/PageBackground";
import theme from "../../theme";

const ONB = {
  brand: theme.colors.primary[500],
  ink: theme.colors.neutral[900],
  muted: theme.colors.neutral[500],
  track: "#D7E3F4",
  card: "#FFFFFF",
};

type Props = {
  step: number;
  totalSteps: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onCta?: () => void;
  children: ReactNode;
};

function BackChevron({ color = ONB.ink }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function OnboardingShell({
  step,
  totalSteps,
  eyebrow = "קצת עליך",
  title,
  subtitle,
  onBack,
  ctaLabel = "המשך",
  ctaDisabled = false,
  onCta,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const progress = Math.min(1, Math.max(0, step / totalSteps));

  return (
    <PageBackground source={require("../../assets/DefaultBlankBackground.png")}>
      <View
        style={[
          styles.root,
          {
            paddingTop: Math.max(insets.top + 8, 44),
            paddingBottom: Math.max(insets.bottom + 12, 20),
          },
        ]}
      >
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {step}/{totalSteps}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={12} style={styles.backHit}>
              <BackChevron />
            </Pressable>
          ) : (
            <View style={styles.backHit} />
          )}
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
              <Text style={styles.title}>{title}</Text>
              {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <Image
              source={require("../../assets/Characters/auth_mascot.png")}
              style={styles.mascot}
            />
          </View>

          <View style={styles.body}>{children}</View>
        </ScrollView>

        {onCta ? (
          <Pressable
            onPress={onCta}
            disabled={ctaDisabled}
            style={({ pressed }) => [
              styles.cta,
              ctaDisabled && styles.ctaDisabled,
              pressed && !ctaDisabled && { transform: [{ scale: 0.985 }] },
            ]}
          >
            <Text style={[styles.ctaText, ctaDisabled && styles.ctaTextDisabled]}>
              {ctaLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </PageBackground>
  );
}

export function OnboardingOptionCard({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        selected && styles.optionCardSelected,
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
        {label}
      </Text>
      <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
        {icon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  flex: { flex: 1 },
  progressRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  progressLabel: {
    fontFamily: theme.font.bold,
    fontSize: 14,
    color: ONB.ink,
    minWidth: 36,
    textAlign: "center",
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: ONB.track,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: ONB.brand,
    borderRadius: 999,
  },
  backHit: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 18,
  },
  headerTextCol: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: theme.font.family,
    fontSize: 13,
    color: ONB.muted,
    textAlign: "right",
    marginBottom: 6,
  },
  title: {
    fontFamily: theme.font.bold,
    fontSize: 28,
    lineHeight: 34,
    color: ONB.ink,
    textAlign: "right",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: theme.font.family,
    fontSize: 15,
    lineHeight: 22,
    color: ONB.muted,
    textAlign: "right",
  },
  mascot: {
    width: 72,
    height: 72,
    resizeMode: "contain",
    marginTop: 4,
  },
  body: {
    gap: 10,
  },
  cta: {
    backgroundColor: ONB.brand,
    borderRadius: 16,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  ctaDisabled: {
    backgroundColor: "#C5D0DE",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: theme.font.bold,
  },
  ctaTextDisabled: {
    color: "#F5F7FA",
  },
  optionCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: ONB.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: ONB.brand,
    backgroundColor: "#F3F8FF",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#C9D4E4",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: ONB.brand,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ONB.brand,
  },
  optionLabel: {
    flex: 1,
    fontFamily: theme.font.bold,
    fontSize: 17,
    color: ONB.ink,
    textAlign: "right",
  },
  optionLabelSelected: {
    color: ONB.brand,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF3F9",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelected: {
    backgroundColor: "#DCEAFF",
  },
});
