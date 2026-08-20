import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../../theme";

type Props = {
  /** Shorter copy for trade modal / tight spaces */
  compact?: boolean;
};

export default function TradingSimulationDisclaimer({ compact = false }: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={[styles.text, compact && styles.textCompact]}>
        {compact
          ? "כסף וירטואלי · מחיר משוער · סימולציה לימודית בלבד"
          : "סימולציה לימודית בכסף וירטואלי · המחירים להמחשה בלבד ועשויים להיות מעוכבים ולא מדויקים ב-100%"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(63, 159, 255, 0.07)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(63, 159, 255, 0.12)",
  },
  wrapCompact: {
    paddingHorizontal: 0,
    paddingVertical: 10,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  text: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: theme.font.family,
    color: "#5A6B7D",
    textAlign: "center",
  },
  textCompact: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },
});
