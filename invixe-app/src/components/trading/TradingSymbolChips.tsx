import React, { useMemo } from "react";
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  View,
} from "react-native";
import theme from "../../theme";
import { usePortfolio } from "../../context/PortfolioContext";

const MARKET_STOCKS = [
  "AAPL",
  "GOOGL",
  "MSFT",
  "AMZN",
  "TSLA",
  "META",
  "NVDA",
  "NFLX",
];

type Props = {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
};

export default function TradingSymbolChips({
  selectedSymbol,
  onSelectSymbol,
}: Props) {
  const { holdings } = usePortfolio();

  const symbols = useMemo(() => {
    const owned = holdings.map((h) => h.symbol.toUpperCase());
    const merged = [...owned];
    for (const s of MARKET_STOCKS) {
      if (!merged.includes(s)) merged.push(s);
    }
    return merged;
  }, [holdings]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {symbols.map((symbol) => {
        const selected = symbol === selectedSymbol.toUpperCase();
        const owned = holdings.some(
          (h) => h.symbol.toUpperCase() === symbol,
        );
        return (
          <Pressable
            key={symbol}
            onPress={() => onSelectSymbol(symbol)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {symbol}
            </Text>
            {owned ? <View style={styles.ownedDot} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#FFFFFF",
    maxHeight: 48,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "#E8F4FF",
    borderColor: theme.colors.primaryBlue,
  },
  chipText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: "#475569",
  },
  chipTextSelected: {
    color: theme.colors.primaryBlue,
  },
  ownedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.growthGreen,
    marginRight: 6,
  },
});
