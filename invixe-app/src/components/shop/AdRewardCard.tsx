import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import theme from "../../theme";
import type { AdReward } from "../../data/shopCatalog";
import { formatMoney } from "../../utils/money";

type Props = {
  reward: AdReward;
  onWatch: () => void;
};

function MiniCash() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        stroke="#12B76A"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function AdRewardCard({ reward, onWatch }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.rewardSide}>
        <View style={styles.iconCircle}>
          <MiniCash />
        </View>
        <Text style={styles.rewardAmount}>+{formatMoney(reward.amount)}</Text>
      </View>
      <Pressable style={styles.watchButton} onPress={onWatch}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} stroke="#FFFFFF" strokeWidth={2} />
          <Path d="M10 8.5l6 3.5-6 3.5V8.5z" fill="#FFFFFF" />
        </Svg>
        <Text style={styles.watchText}>צפה</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 64,
  },
  rewardSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F4F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardAmount: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
  },
  watchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  watchText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: theme.font.bold,
  },
});
