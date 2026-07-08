import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import theme from "../../theme";
import { formatMoney, formatPercent } from "../../utils/portfolioNormalize";

type Props = {
  symbol: string;
  stockName: string;
  livePrice: number | null;
  liveChangePercent: number | null;
  sharesHeld?: number;
  avgPrice?: number;
  cash?: number;
  visible?: boolean;
  style?: ViewStyle;
};

function MiniStat({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text
        style={[styles.miniValue, valueColor ? { color: valueColor } : null]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export default function TradingTickerOverlay({
  symbol,
  stockName,
  livePrice,
  liveChangePercent,
  sharesHeld = 0,
  avgPrice = 0,
  cash = 0,
  visible = true,
  style,
}: Props) {
  const reveal = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.spring(reveal, {
      toValue: visible ? 1 : 0,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [visible, reveal]);

  useEffect(() => {
    setExpanded(false);
  }, [symbol]);

  const dayChange = liveChangePercent ?? 0;
  const isUp = dayChange > 0.05;
  const isDown = dayChange < -0.05;
  const tone = isUp
    ? theme.colors.growthGreen
    : isDown
      ? "#F97066"
      : "#94A3B8";

  const dayDollar = useMemo(() => {
    if (!livePrice || !Number.isFinite(dayChange)) return null;
    const prev = livePrice / (1 + dayChange / 100);
    if (!Number.isFinite(prev) || prev <= 0) return null;
    return livePrice - prev;
  }, [livePrice, dayChange]);

  const position = useMemo(() => {
    if (!(sharesHeld > 0) || !(livePrice && livePrice > 0) || !(avgPrice > 0)) {
      return null;
    }
    const marketValue = sharesHeld * livePrice;
    const cost = sharesHeld * avgPrice;
    const pnl = marketValue - cost;
    const pnlPct = (pnl / cost) * 100;
    return { marketValue, pnl, pnlPct };
  }, [sharesHeld, livePrice, avgPrice]);

  const maxBuy = useMemo(() => {
    if (!livePrice || livePrice <= 0 || cash <= 0) return 0;
    return Math.floor(cash / livePrice);
  }, [cash, livePrice]);

  const pnlColor =
    position && position.pnl > 0.01
      ? theme.colors.growthGreen
      : position && position.pnl < -0.01
        ? "#F97066"
        : "#94A3B8";

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        style,
        {
          opacity: reveal,
          transform: [
            {
              translateY: reveal.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={[styles.card, expanded && styles.cardExpanded]}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "סגור פרטי טיקר" : "הצג פרטי טיקר"}
      >
        <View style={styles.compactRow}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.price} numberOfLines={1}>
            {livePrice ? formatMoney(livePrice) : "—"}
          </Text>
          <View style={[styles.changePill, { backgroundColor: `${tone}28` }]}>
            <Text style={[styles.changeText, { color: tone }]}>
              {formatPercent(dayChange)}
            </Text>
          </View>
          <Text style={styles.chevron}>{expanded ? "▴" : "▾"}</Text>
        </View>

        {expanded ? (
          <View style={styles.details}>
            <Text style={styles.name} numberOfLines={1}>
              {stockName}
            </Text>

            {dayDollar != null ? (
              <Text style={[styles.dayDollar, { color: tone }]}>
                היום {dayDollar >= 0 ? "+" : ""}
                {formatMoney(dayDollar)}
              </Text>
            ) : null}

            <View style={styles.statsRow}>
              {position ? (
                <>
                  <MiniStat label="בתיק" value={`${sharesHeld}`} />
                  <MiniStat
                    label="PnL"
                    value={formatPercent(position.pnlPct)}
                    valueColor={pnlColor}
                  />
                  <MiniStat
                    label="שווי"
                    value={formatMoney(position.marketValue)}
                  />
                  <MiniStat label="ממוצע" value={formatMoney(avgPrice)} />
                </>
              ) : (
                <>
                  <MiniStat label="מזומן" value={formatMoney(cash)} />
                  <MiniStat
                    label="לקנייה"
                    value={maxBuy > 0 ? String(maxBuy) : "—"}
                  />
                </>
              )}
            </View>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 6,
    elevation: 10,
  },
  card: {
    backgroundColor: "rgba(10, 18, 28, 0.72)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    maxWidth: 220,
  },
  cardExpanded: {
    paddingBottom: 9,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  symbol: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: "#F8FAFC",
    letterSpacing: 0.3,
  },
  price: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  changePill: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  changeText: {
    fontSize: 10,
    fontFamily: theme.font.bold,
  },
  chevron: {
    fontSize: 10,
    color: "#94A3B8",
    marginLeft: 2,
  },
  details: {
    marginTop: 8,
    gap: 6,
  },
  name: {
    fontSize: 10,
    fontFamily: theme.font.family,
    color: "#94A3B8",
  },
  dayDollar: {
    fontSize: 11,
    fontFamily: theme.font.bold,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  miniStat: {
    minWidth: 72,
    gap: 1,
  },
  miniLabel: {
    fontSize: 9,
    fontFamily: theme.font.family,
    color: "#64748B",
  },
  miniValue: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    color: "#E2E8F0",
  },
});
