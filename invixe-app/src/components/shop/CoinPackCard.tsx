import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import theme from "../../theme";
import type { CoinPack } from "../../data/shopCatalog";

type Props = {
  pack: CoinPack;
  width: number;
  onPress: () => void;
};

function CashStacks({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scale = size === "lg" ? 1.35 : size === "md" ? 1.1 : 0.85;
  return (
    <Svg width={70 * scale} height={50 * scale} viewBox="0 0 70 50">
      <Rect x={8} y={22} width={28} height={14} rx={3} fill="#12B76A" />
      <Rect x={14} y={16} width={28} height={14} rx={3} fill="#34D399" />
      <Rect x={20} y={10} width={28} height={14} rx={3} fill="#6EE7B7" />
      {size === "lg" && (
        <>
          <Rect x={34} y={18} width={22} height={28} rx={4} fill="#94A3B8" />
          <Path
            d="M38 22h14v18H38z"
            stroke="#64748B"
            strokeWidth={1.5}
            fill="#CBD5E1"
          />
        </>
      )}
    </Svg>
  );
}

export default function CoinPackCard({ pack, width, onPress }: Props) {
  const stackSize =
    pack.id === "whale" ? "lg" : pack.id === "trader" ? "md" : "sm";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width },
        pack.popular && styles.cardPopular,
        pressed && styles.pressed,
      ]}
    >
      {pack.popular && (
        <View style={styles.popularRibbon}>
          <Text style={styles.popularRibbonText}>הכי פופולרי</Text>
        </View>
      )}
      {pack.bonusLabel ? (
        <View
          style={[
            styles.bonusTag,
            pack.bonusTone === "purple" && styles.bonusTagPurple,
          ]}
        >
          <Text style={styles.bonusTagText}>{pack.bonusLabel}</Text>
        </View>
      ) : null}
      <Text style={styles.packTitle}>{pack.title}</Text>
      <Text style={styles.amount}>+{pack.amount.toLocaleString("he-IL")}</Text>
      <View style={styles.artWrap}>
        <CashStacks size={stackSize} />
      </View>
      <View style={styles.priceButton}>
        <Text style={styles.priceText}>{pack.priceLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingTop: 14,
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: "center",
    marginEnd: 10,
    minHeight: 200,
  },
  cardPopular: {
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  popularRibbon: {
    position: "absolute",
    top: -1,
    alignSelf: "center",
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 2,
  },
  popularRibbonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: theme.font.bold,
  },
  bonusTag: {
    position: "absolute",
    top: 52,
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 2,
  },
  bonusTagPurple: {
    backgroundColor: "#7C3AED",
  },
  bonusTagText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: theme.font.bold,
  },
  packTitle: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
    marginTop: 8,
    textAlign: "center",
  },
  amount: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
    marginTop: 4,
    textAlign: "center",
  },
  artWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 72,
    marginVertical: 6,
  },
  priceButton: {
    width: "100%",
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  priceText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[600],
  },
});
