import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import theme from "../../theme";
import { usePortfolio } from "../../context/PortfolioContext";
import { useUser } from "../../context/UserContext";
import { formatPercent, formatMoney } from "../../utils/portfolioNormalize";

type Props = {
  onOpenProfile?: () => void;
};

export default function TradingPortfolioBar({ onOpenProfile }: Props) {
  const { cash } = useUser();
  const { portfolioStats, holdings, loading } = usePortfolio();
  const gainColor =
    portfolioStats.gainPercent > 0.05
      ? theme.colors.growthGreen
      : portfolioStats.gainPercent < -0.05
        ? theme.colors.error[600]
        : "#64748B";

  return (
    <Pressable style={styles.wrap} onPress={onOpenProfile}>
      <View style={styles.statBlock}>
        <Text style={styles.label}>שווי תיק</Text>
        <Text style={styles.value}>{formatMoney(portfolioStats.totalValue)}</Text>
        {holdings.length > 0 && (
          <Text style={[styles.sub, { color: gainColor }]}>
            {formatPercent(portfolioStats.gainPercent)}
          </Text>
        )}
      </View>
      <View style={styles.divider} />
      <View style={styles.statBlock}>
        <Text style={styles.label}>מזומן</Text>
        <Text style={styles.value}>{formatMoney(cash)}</Text>
        <Text style={styles.sub}>{holdings.length} אחזקות</Text>
      </View>
      {loading ? (
        <Text style={styles.loadingHint}>מעדכן...</Text>
      ) : (
        <Text style={styles.chevron}>פרופיל ›</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 34, 51, 0.08)",
    shadowColor: "#0F2233",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: theme.font.family,
    marginBottom: 2,
  },
  value: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: "#0F2233",
  },
  sub: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    marginTop: 2,
    color: "#64748B",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(15, 34, 51, 0.1)",
    marginHorizontal: 14,
  },
  chevron: {
    fontSize: 13,
    color: theme.colors.primaryBlue,
    fontFamily: theme.font.bold,
    marginLeft: 8,
  },
  loadingHint: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 8,
  },
});
