import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import theme from "../../theme";

const RANGES = [
  { id: "1h", label: "1ש׳" },
  { id: "1d", label: "יום" },
  { id: "1w", label: "שבוע" },
  { id: "1mo", label: "חודש" },
] as const;

type Props = {
  selected: string;
  onSelect: (range: string) => void;
};

export default function TradingTimeframeBar({ selected, onSelect }: Props) {
  return (
    <View style={styles.bar}>
      {RANGES.map((range) => {
        const active = selected === range.id;
        return (
          <Pressable
            key={range.id}
            onPress={() => onSelect(range.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {range.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 34, 51, 0.06)",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  chipActive: {
    backgroundColor: "#0F2233",
  },
  label: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: "#475569",
  },
  labelActive: {
    color: "#FFFFFF",
  },
});
