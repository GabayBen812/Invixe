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

const RANGES = [
  { id: "1h", label: "1ש׳" },
  { id: "1d", label: "יום" },
  { id: "1w", label: "שבוע" },
  { id: "1mo", label: "חודש" },
] as const;

type Props = {
  selectedSymbol: string;
  selectedRange: string;
  onSelectSymbol: (symbol: string) => void;
  onSelectRange: (range: string) => void;
};

export default function TradingControlsBar({
  selectedSymbol,
  selectedRange,
  onSelectSymbol,
  onSelectRange,
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
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {RANGES.map((range) => {
          const active = selectedRange === range.id;
          return (
            <Pressable
              key={range.id}
              onPress={() => onSelectRange(range.id)}
              style={[styles.rangeChip, active && styles.rangeChipActive]}
            >
              <Text
                style={[styles.rangeText, active && styles.rangeTextActive]}
              >
                {range.label}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.divider} />

        {symbols.map((symbol) => {
          const selected = symbol === selectedSymbol.toUpperCase();
          const owned = holdings.some(
            (h) => h.symbol.toUpperCase() === symbol,
          );
          return (
            <Pressable
              key={symbol}
              onPress={() => onSelectSymbol(symbol)}
              style={[styles.symbolChip, selected && styles.symbolChipActive]}
            >
              {owned ? <View style={styles.ownedDot} /> : null}
              <Text
                style={[
                  styles.symbolText,
                  selected && styles.symbolTextActive,
                ]}
              >
                {symbol}
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 34, 51, 0.06)",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  rangeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  rangeChipActive: {
    backgroundColor: "#0F2233",
  },
  rangeText: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    color: "#64748B",
  },
  rangeTextActive: {
    color: "#FFFFFF",
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(15, 34, 51, 0.12)",
    marginHorizontal: 2,
  },
  symbolChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "transparent",
  },
  symbolChipActive: {
    backgroundColor: "#E8F4FF",
    borderColor: theme.colors.primaryBlue,
  },
  symbolText: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: "#64748B",
  },
  symbolTextActive: {
    color: theme.colors.primaryBlue,
  },
  ownedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.growthGreen,
    marginRight: 4,
  },
});
