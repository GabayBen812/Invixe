import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import Svg, { Path, Rect } from "react-native-svg";
import theme from "../../theme";
import {
  buildStockResearchPrompt,
  STOCK_RESEARCH_CATEGORIES,
  STOCK_RESEARCH_QUICK_PICKS,
  type ResearchCategoryVariant,
} from "../../modules/knowledge/stockResearchPrompt";

function CopyIcon({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect
        x={9}
        y={9}
        width={11}
        height={11}
        rx={2}
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M6 15H5C3.89543 15 3 14.1046 3 13V5C3 3.89543 3.89543 3 5 3H13C14.1046 3 15 3.89543 15 5V6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function FinanceBuildingIllustration() {
  return (
    <View style={styles.heroArt}>
      <View style={styles.heroArtBuilding}>
        <Text style={styles.heroArtSign}>FINANCE{"\n"}SOLUTIONS</Text>
      </View>
      <View style={styles.heroArtFlag} />
      <Text style={styles.heroArtWarn}>⚠</Text>
    </View>
  );
}

function CategoryPill({
  label,
  variant = "default",
}: {
  label: string;
  variant?: ResearchCategoryVariant;
}) {
  const pillStyle =
    variant === "danger"
      ? styles.pillDanger
      : variant === "success"
        ? styles.pillSuccess
        : styles.pillDefault;
  const textStyle =
    variant === "danger"
      ? styles.pillTextDanger
      : variant === "success"
        ? styles.pillTextSuccess
        : styles.pillTextDefault;

  return (
    <View style={[styles.pill, pillStyle]}>
      <Text style={[styles.pillText, textStyle]}>{label}</Text>
    </View>
  );
}

export default function StockResearchTab() {
  const [symbol, setSymbol] = useState("");
  const [copied, setCopied] = useState(false);

  const trimmedSymbol = symbol.trim();
  const canCopy = trimmedSymbol.length > 0;

  const handleCopy = useCallback(async () => {
    if (!canCopy) {
      Alert.alert("חסר טיקר", "הזינו טיקר או שם חברה לפני העתקת הפרומפט.");
      return;
    }

    await Clipboard.setStringAsync(buildStockResearchPrompt(trimmedSymbol));
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [canCopy, trimmedSymbol]);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <FinanceBuildingIllustration />
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>כלי עזר לומד</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>כרטיס מחקר מניה</Text>
        <Text style={styles.heroSubtitle}>
          קבלו סקירה לימודית מסודרת על כל חברה — 12 נקודות בדיקה, בלי המלצות
          קנייה או מכירה.
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputTitle}>איזו מניה נבדוק?</Text>
        <Text style={styles.inputHint}>
          הזינו טיקר או שם חברה — נשלב אותו בפרומפט.
        </Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>↗</Text>
          <TextInput
            style={styles.input}
            value={symbol}
            onChangeText={setSymbol}
            placeholder="לדוגמה: AAPL, Tesla, NICE"
            placeholderTextColor={theme.colors.neutral[400]}
            autoCapitalize="characters"
            autoCorrect={false}
            textAlign="right"
            returnKeyType="done"
          />
        </View>

        <View style={styles.quickPicksRow}>
          {STOCK_RESEARCH_QUICK_PICKS.map((pick) => {
            const selected = trimmedSymbol.toUpperCase() === pick;
            return (
              <Pressable
                key={pick}
                style={[styles.quickPick, selected && styles.quickPickSelected]}
                onPress={() => setSymbol(pick)}
              >
                <Text
                  style={[
                    styles.quickPickText,
                    selected && styles.quickPickTextSelected,
                  ]}
                >
                  {pick}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.copyButton,
          !canCopy && styles.copyButtonDisabled,
          pressed && canCopy && styles.pressed,
        ]}
        onPress={() => void handleCopy()}
        disabled={!canCopy}
        accessibilityRole="button"
        accessibilityLabel="העתק פרומפט לניתוח"
      >
        <CopyIcon color={canCopy ? "#FFFFFF" : theme.colors.neutral[400]} />
        <Text
          style={[
            styles.copyButtonText,
            !canCopy && styles.copyButtonTextDisabled,
          ]}
        >
          {copied ? "הועתק!" : "העתק פרומפט לניתוח"}
        </Text>
      </Pressable>

      <Text style={styles.copyFootnote}>
        מדביקים ב-ChatGPT, Claude או Gemini ומריצים 🔎
      </Text>

      <View style={styles.includedCard}>
        <Text style={styles.includedTitle}>מה כלול בפרומפט</Text>
        <Text style={styles.includedSubtitle}>
          12 נקודות בדיקה + ציון 1–10 לכל קטגוריה עם רמת ביטחון.
        </Text>
        <View style={styles.pillsWrap}>
          {STOCK_RESEARCH_CATEGORIES.map((category) => (
            <CategoryPill
              key={category.id}
              label={category.label}
              variant={category.variant}
            />
          ))}
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerIcon}>⚠</Text>
        <Text style={styles.disclaimerText}>
          הכלי נועד ללמידה בלבד ואינו מהווה ייעוץ או המלצת השקעה. תמיד בדקו את
          הנתונים במקור לפני כל החלטה.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
    gap: 14,
  },
  heroCard: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 18,
    padding: 18,
    overflow: "hidden",
    shadowColor: theme.colors.primary[700],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.growthGreen,
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
  heroArt: {
    width: 92,
    height: 72,
    position: "relative",
  },
  heroArtBuilding: {
    width: 78,
    height: 58,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  heroArtSign: {
    fontSize: 8,
    lineHeight: 10,
    textAlign: "center",
    fontFamily: theme.font.bold,
    color: theme.colors.primary[700],
  },
  heroArtFlag: {
    position: "absolute",
    top: 4,
    left: 0,
    width: 14,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#F97066",
  },
  heroArtWarn: {
    position: "absolute",
    bottom: 0,
    left: 8,
    fontSize: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
    textAlign: "right",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: theme.font.family,
    color: "rgba(255,255,255,0.92)",
    textAlign: "right",
  },
  inputSection: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: 16,
    gap: 8,
  },
  inputTitle: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  inputHint: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "right",
    lineHeight: 19,
  },
  inputWrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 14,
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: 14,
    marginTop: 4,
  },
  inputIcon: {
    fontSize: 14,
    color: theme.colors.neutral[400],
    transform: [{ rotate: "-45deg" }],
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: theme.font.family,
    color: theme.colors.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  quickPicksRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  quickPick: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  quickPickSelected: {
    backgroundColor: theme.colors.info[100],
    borderColor: theme.colors.primary[400],
  },
  quickPickText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[700],
  },
  quickPickTextSelected: {
    color: theme.colors.primary[600],
  },
  copyButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 14,
    paddingVertical: 15,
    shadowColor: theme.colors.primary[700],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  copyButtonDisabled: {
    backgroundColor: theme.colors.neutral[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  copyButtonText: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
  copyButtonTextDisabled: {
    color: theme.colors.neutral[500],
  },
  copyFootnote: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "center",
  },
  includedCard: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: 16,
    gap: 8,
  },
  includedTitle: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  includedSubtitle: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "right",
    lineHeight: 19,
    marginBottom: 4,
  },
  pillsWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  pillDefault: {
    backgroundColor: theme.colors.neutral[100],
    borderColor: theme.colors.border.subtle,
  },
  pillDanger: {
    backgroundColor: theme.colors.error[100],
    borderColor: "rgba(217, 45, 32, 0.15)",
  },
  pillSuccess: {
    backgroundColor: theme.colors.success[100],
    borderColor: "rgba(18, 183, 106, 0.18)",
  },
  pillText: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    textAlign: "right",
  },
  pillTextDefault: {
    color: theme.colors.neutral[700],
  },
  pillTextDanger: {
    color: theme.colors.error[600],
  },
  pillTextSuccess: {
    color: theme.colors.growthGreen,
  },
  disclaimer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: theme.colors.warning[100],
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(247, 144, 9, 0.18)",
  },
  disclaimerIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[700],
    textAlign: "right",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
