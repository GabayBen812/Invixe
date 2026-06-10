import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../../theme";
import { usePortfolio } from "../../context/PortfolioContext";
import { formatPercent, formatUsd } from "../../utils/portfolioNormalize";

type Props = {
  symbol: string;
  livePrice: number | null;
  liveChange?: number | null;
  liveChangePercent?: number | null;
  stockName?: string;
};

export default function TradingPositionCard({
  symbol,
  livePrice,
  liveChange,
  liveChangePercent,
  stockName,
}: Props) {
  const { getHolding, getHoldingChangePercent } = usePortfolio();
  const holding = getHolding(symbol);
  const price = livePrice ?? 0;
  const positionChange = holding ? getHoldingChangePercent(holding) : null;
  const dayChangePercent = liveChangePercent ?? 0;
  const displayChange = positionChange ?? dayChangePercent;

  if (!holding && !livePrice) return null;

  const marketValue = holding ? holding.shares * price : 0;
  const costBasis = holding ? holding.shares * holding.avgPrice : 0;
  const unrealized = marketValue - costBasis;
  const pnlColor =
    unrealized > 0.01
      ? theme.colors.growthGreen
      : unrealized < -0.01
        ? theme.colors.error[600]
        : "#64748B";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.symbolBlock}>
          <Text style={styles.symbol}>{symbol}</Text>
          {stockName ? (
            <Text style={styles.name} numberOfLines={1}>
              {stockName}
            </Text>
          ) : null}
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.livePrice}>
            {price > 0 ? formatUsd(price) : "—"}
          </Text>
          {livePrice != null && (
            <Text
              style={[
                styles.change,
                {
                  color:
                    displayChange > 0.05
                      ? theme.colors.growthGreen
                      : displayChange < -0.05
                        ? theme.colors.error[600]
                        : "#64748B",
                },
              ]}
            >
              {liveChange != null && !holding
                ? `${liveChange >= 0 ? "+" : ""}${liveChange.toFixed(2)} `
                : ""}
              {formatPercent(displayChange)}
              {holding ? " בתיק" : " היום"}
            </Text>
          )}
        </View>
      </View>

      {holding ? (
        <View style={styles.holdingRow}>
          <View style={styles.holdingStat}>
            <Text style={styles.holdingLabel}>מניות</Text>
            <Text style={styles.holdingValue}>{holding.shares}</Text>
          </View>
          <View style={styles.holdingStat}>
            <Text style={styles.holdingLabel}>מחיר ממוצע</Text>
            <Text style={styles.holdingValue}>{formatUsd(holding.avgPrice)}</Text>
          </View>
          <View style={styles.holdingStat}>
            <Text style={styles.holdingLabel}>רווח/הפסד</Text>
            <Text style={[styles.holdingValue, { color: pnlColor }]}>
              {formatUsd(unrealized)}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyHint}>אין לך מניות של {symbol} בתיק</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 34, 51, 0.08)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  symbolBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  symbol: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: "#0F2233",
  },
  name: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    maxWidth: 180,
    textAlign: "right",
  },
  priceBlock: {
    alignItems: "flex-start",
    marginLeft: 12,
  },
  livePrice: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: "#0F2233",
  },
  change: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    marginTop: 2,
  },
  holdingRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 34, 51, 0.08)",
    gap: 8,
  },
  holdingStat: {
    flex: 1,
    alignItems: "center",
  },
  holdingLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 4,
  },
  holdingValue: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: "#0F2233",
  },
  emptyHint: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
    textAlign: "right",
  },
});
