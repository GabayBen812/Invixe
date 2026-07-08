import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import theme from "../../theme";
import { formatMoney } from "../../utils/money";

export type TradeHistoryItem = {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  shares: number;
  price: number;
  total: number;
  createdAt: string;
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

export function formatTradeTime(iso: string): string {
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

type Props = {
  trade: TradeHistoryItem;
  showDivider?: boolean;
};

export default function TradeHistoryRow({ trade, showDivider }: Props) {
  const isBuy = trade.type === "buy";
  const accent = isBuy ? theme.colors.growthGreen : "#D92D20";
  const tint = isBuy ? "#ECFDF3" : "#FEF3F2";
  const border = isBuy
    ? "rgba(18, 183, 106, 0.18)"
    : "rgba(240, 68, 56, 0.16)";

  return (
    <View style={[styles.row, showDivider && styles.rowDivider]}>
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
}

const styles = StyleSheet.create({
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
});
