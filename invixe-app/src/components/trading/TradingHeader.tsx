import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../../theme";
import { usePortfolio } from "../../context/PortfolioContext";
import { formatPercent, formatUsd } from "../../utils/portfolioNormalize";

type Props = {
  symbol: string;
  stockName: string;
  livePrice: number | null;
  liveChangePercent: number | null;
};

export default function TradingHeader({
  symbol,
  stockName,
  livePrice,
  liveChangePercent,
}: Props) {
  const { getHolding } = usePortfolio();
  const holding = getHolding(symbol);
  const dayChange = liveChangePercent ?? 0;
  const changeColor =
    dayChange > 0.05
      ? theme.colors.growthGreen
      : dayChange < -0.05
        ? theme.colors.error[600]
        : "#64748B";

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.symbolBlock}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {stockName}
            {holding
              ? ` · ${holding.shares} מניות`
              : ""}
          </Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>
            {livePrice ? formatUsd(livePrice) : "—"}
          </Text>
          <Text style={[styles.priceChange, { color: changeColor }]}>
            {formatPercent(dayChange)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  symbolBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  symbol: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: "#0F2233",
  },
  meta: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
    textAlign: "right",
  },
  priceBlock: {
    alignItems: "flex-start",
  },
  price: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: "#0F2233",
  },
  priceChange: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    marginTop: 1,
  },
});
