import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import theme from "../../theme";
import { usePortfolio } from "../../context/PortfolioContext";
import { formatPercent } from "../../utils/portfolioNormalize";

type Props = {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
};

export default function TradingHoldingsStrip({
  selectedSymbol,
  onSelectSymbol,
}: Props) {
  const { holdings, getHoldingChangePercent } = usePortfolio();

  if (holdings.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>התיק שלי</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {holdings.map((holding) => {
          const selected =
            holding.symbol.toUpperCase() === selectedSymbol.toUpperCase();
          const change = getHoldingChangePercent(holding);
          const changeColor =
            change > 0.05
              ? theme.colors.growthGreen
              : change < -0.05
                ? theme.colors.error[600]
                : "#64748B";

          return (
            <Pressable
              key={holding.id}
              onPress={() => onSelectSymbol(holding.symbol)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.symbol, selected && styles.symbolSelected]}>
                {holding.symbol}
              </Text>
              <Text style={[styles.meta, selected && styles.metaSelected]}>
                {holding.shares} מניות
              </Text>
              <Text style={[styles.change, { color: changeColor }]}>
                {formatPercent(change)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: "#475569",
    textAlign: "right",
    marginBottom: 8,
  },
  scrollContent: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 96,
    alignItems: "flex-end",
    borderWidth: 1.5,
    borderColor: "rgba(15, 34, 51, 0.08)",
  },
  chipSelected: {
    backgroundColor: "#E8F4FF",
    borderColor: theme.colors.primaryBlue,
  },
  symbol: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: "#0F2233",
  },
  symbolSelected: {
    color: theme.colors.primaryBlue,
  },
  meta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  metaSelected: {
    color: "#475569",
  },
  change: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    marginTop: 4,
  },
});
