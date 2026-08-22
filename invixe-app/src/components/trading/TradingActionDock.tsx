import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import theme from "../../theme";

type Props = {
  sellShares: number;
  onBuy: () => void;
  onSell: () => void;
  locked?: boolean;
};

export default function TradingActionDock({
  sellShares,
  onBuy,
  onSell,
  locked = false,
}: Props) {
  const canSell = !locked && sellShares > 0;

  return (
    <View style={styles.dock}>
      <Pressable
        style={[styles.button, styles.buyButton, locked && styles.buttonDisabled]}
        onPress={onBuy}
        disabled={locked}
      >
        <Text style={styles.buttonText}>קנה</Text>
      </Pressable>
      <Pressable
        style={[
          styles.button,
          styles.sellButton,
          !canSell && styles.buttonDisabled,
        ]}
        onPress={onSell}
        disabled={!canSell}
      >
        <Text style={styles.buttonText}>מכור</Text>
        {canSell ? (
          <Text style={styles.buttonHint}>{sellShares} בתיק</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 34, 51, 0.08)",
    shadowColor: "#0F2233",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buyButton: {
    backgroundColor: theme.colors.growthGreen,
  },
  sellButton: {
    backgroundColor: theme.colors.error[600],
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
  buttonHint: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    fontFamily: theme.font.family,
  },
});
