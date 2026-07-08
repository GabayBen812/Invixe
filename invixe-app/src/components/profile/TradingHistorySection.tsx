import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import theme from "../../theme";
import { formatMoney } from "../../utils/money";
import { API_BASE_URL } from "../../config/api";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";
import { useUser } from "../../context/UserContext";

export type TradeHistoryItem = {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  shares: number;
  price: number;
  total: number;
  createdAt: string;
};

type Props = {
  onOpenTrading?: () => void;
  /** Re-fetch when this key changes (e.g. screen focus counter). */
  refreshKey?: number;
  initialLimit?: number;
};

function BuyIcon({ color = "#12B76A" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SellIcon({ color = "#F04438" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function formatTradeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfThatDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfThatDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  const time = date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (dayDiff === 0) return `היום · ${time}`;
  if (dayDiff === 1) return `אתמול · ${time}`;
  if (dayDiff < 7) {
    const weekday = date.toLocaleDateString("he-IL", { weekday: "long" });
    return `${weekday} · ${time}`;
  }

  const day = date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
  return `${day} · ${time}`;
}

export default function TradingHistorySection({
  onOpenTrading,
  refreshKey = 0,
  initialLimit = 8,
}: Props) {
  const { currentUserEmail } = useUser();
  const [trades, setTrades] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!currentUserEmail) {
      setTrades([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/user/portfolio/history?email=${encodeURIComponent(
        currentUserEmail,
      )}&limit=100`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error("Failed to load trade history");
      const data = await res.json();
      const next = Array.isArray(data.trades) ? data.trades : [];
      setTrades(
        next.map((t: TradeHistoryItem) => ({
          ...t,
          type: t.type === "sell" ? "sell" : "buy",
          shares: Number(t.shares) || 0,
          price: Number(t.price) || 0,
          total: Number(t.total) || 0,
        })),
      );
    } catch (e) {
      console.error("Error loading trade history:", e);
      setError("לא הצלחנו לטעון את היסטוריית המסחר");
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory, refreshKey]);

  const visibleTrades = useMemo(() => {
    if (expanded) return trades;
    return trades.slice(0, initialLimit);
  }, [expanded, trades, initialLimit]);

  const hasMore = trades.length > initialLimit;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>היסטוריית מסחר</Text>
        {onOpenTrading ? (
          <Pressable onPress={onOpenTrading} hitSlop={8}>
            <Text style={styles.link}>למסחר ›</Text>
          </Pressable>
        ) : null}
      </View>

      {loading && trades.length === 0 ? (
        <ActivityIndicator
          color={theme.colors.primary[400]}
          style={styles.loader}
        />
      ) : error ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable onPress={() => void loadHistory()} hitSlop={8}>
            <Text style={styles.link}>נסה שוב</Text>
          </Pressable>
        </View>
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
          {visibleTrades.map((trade, index) => {
            const isBuy = trade.type === "buy";
            const accent = isBuy
              ? theme.colors.growthGreen
              : theme.colors.error[600];
            const tint = isBuy ? "#ECFDF3" : "#FEF3F2";
            const border = isBuy
              ? "rgba(18, 183, 106, 0.18)"
              : "rgba(240, 68, 56, 0.16)";
            return (
              <View
                key={trade.id || `${trade.symbol}-${trade.createdAt}-${index}`}
                style={[
                  styles.row,
                  index < visibleTrades.length - 1 && styles.rowDivider,
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: tint, borderColor: border }]}>
                  {isBuy ? <BuyIcon color={accent} /> : <SellIcon color={accent} />}
                </View>

                <View style={styles.meta}>
                  <View style={styles.metaTop}>
                    <Text style={styles.symbol}>{trade.symbol}</Text>
                    <View style={[styles.typePill, { backgroundColor: tint }]}>
                      <Text style={[styles.typeText, { color: accent }]}>
                        {isBuy ? "קנייה" : "מכירה"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.detail}>
                    {trade.shares} מניות · {formatMoney(trade.price)} למניה
                  </Text>
                  <Text style={styles.time}>{formatTradeTime(trade.createdAt)}</Text>
                </View>

                <View style={styles.amountCol}>
                  <Text style={[styles.amount, { color: accent }]}>
                    {isBuy ? "−" : "+"}
                    {formatMoney(trade.total)}
                  </Text>
                </View>
              </View>
            );
          })}

          {hasMore ? (
            <Pressable
              style={styles.expandBtn}
              onPress={() => setExpanded((v) => !v)}
            >
              <Text style={styles.expandText}>
                {expanded
                  ? "הצג פחות"
                  : `הצג את כל הפעולות (${trades.length})`}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
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
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  meta: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },
  metaTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  symbol: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
  },
  typePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 11,
    fontFamily: theme.font.bold,
  },
  detail: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "right",
  },
  time: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "right",
  },
  amountCol: {
    alignItems: "flex-start",
    flexShrink: 0,
    minWidth: 88,
  },
  amount: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    textAlign: "left",
  },
  expandBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 2,
  },
  expandText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[400],
  },
});
