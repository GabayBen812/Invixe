import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import theme from "../../theme";
import { API_BASE_URL } from "../../config/api";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";
import { useUser } from "../../context/UserContext";
import TradeHistoryRow, { type TradeHistoryItem } from "./TradeHistoryRow";
import TradeHistoryModal from "./TradeHistoryModal";

export type { TradeHistoryItem };

type Props = {
  onOpenTrading?: () => void;
  /** Re-fetch when this key changes (e.g. screen focus counter). */
  refreshKey?: number;
  /** How many recent trades to preview on the screen itself. */
  previewLimit?: number;
};

export default function TradingHistorySection({
  onOpenTrading,
  refreshKey = 0,
  previewLimit = 3,
}: Props) {
  const { currentUserEmail } = useUser();
  const [trades, setTrades] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!currentUserEmail) {
      setTrades([]);
      return;
    }
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/user/portfolio/history?email=${encodeURIComponent(
        currentUserEmail,
      )}&limit=100`;
      const res = await fetchWithTimeout(url);
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      const next = Array.isArray(data?.trades) ? data.trades : [];
      setTrades(
        next.map((t: TradeHistoryItem) => ({
          ...t,
          type: t.type === "sell" ? "sell" : "buy",
          shares: Number(t.shares) || 0,
          price: Number(t.price) || 0,
          total: Number(t.total) || 0,
        })),
      );
    } catch {
      // No trades / offline / table missing — empty history is a valid state.
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory, refreshKey]);

  const sortedTrades = useMemo(() => {
    return [...trades].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [trades]);

  const previewTrades = useMemo(
    () => sortedTrades.slice(0, previewLimit),
    [sortedTrades, previewLimit],
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>היסטוריית מסחר</Text>
        {trades.length > 0 ? (
          <Pressable
            onPress={() => setHistoryModalVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="לצפייה בהיסטוריה המלאה"
          >
            <Text style={styles.link}>לצפייה בהיסטוריה המלאה ›</Text>
          </Pressable>
        ) : null}
      </View>

      {loading && trades.length === 0 ? (
        <ActivityIndicator
          color={theme.colors.primary[400]}
          style={styles.loader}
        />
      ) : trades.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>עדיין אין פעולות מסחר</Text>
          {onOpenTrading ? (
            <Pressable onPress={onOpenTrading} hitSlop={8}>
              <Text style={styles.link}>בצע את העסקה הראשונה ›</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={styles.list}>
          {previewTrades.map((trade, index) => (
            <TradeHistoryRow
              key={trade.id || `${trade.symbol}-${trade.createdAt}-${index}`}
              trade={trade}
              showDivider={index < previewTrades.length - 1}
            />
          ))}
        </View>
      )}

      <TradeHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        trades={sortedTrades}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EAF1F9",
    shadowColor: "#0F2233",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  link: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[400],
    textAlign: "right",
  },
  loader: {
    marginVertical: 24,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 22,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "center",
  },
  list: {
    gap: 0,
  },
});
