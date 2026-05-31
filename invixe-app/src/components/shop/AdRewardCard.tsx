import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import theme from "../../theme";
import type { AdReward } from "../../data/shopCatalog";

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

function MiniBolt() {
  return (
    <Svg width={24} height={24} viewBox="0 0 28 27" fill="none">
      <Path
        d="M17.6562 1.99915L12.9043 24.3312C12.7171 24.6127 12.4406 24.8234 12.1191 24.9279C11.7974 25.0324 11.4489 25.0243 11.1318 24.9064C10.815 24.7884 10.5472 24.5667 10.3721 24.2775C10.197 23.9882 10.1246 23.6481 10.167 23.3126L10.957 16.9991H7.65625C7.42338 16.9991 7.19363 16.9451 6.98535 16.8409C6.77713 16.7368 6.59576 16.5858 6.45605 16.3995C6.31639 16.2133 6.22234 15.9967 6.18066 15.7677C6.13902 15.5387 6.15067 15.3027 6.21582 15.0792L9.71582 3.07922C9.80668 2.76771 9.99629 2.49368 10.2559 2.29895C10.5155 2.10422 10.8317 1.99915 11.1562 1.99915H17.6562Z"
        fill="#62D24C"
        stroke="#368642"
      />
    </Svg>
  );
}

export default function AdRewardCard({ reward, onWatch }: Props) {
  const isCoins = reward.kind === "coins";

  return (
    <View style={styles.card}>
      <View style={styles.rewardSide}>
        <View style={styles.iconCircle}>
          {isCoins ? <MiniCash /> : <MiniBolt />}
        </View>
        <Text style={styles.rewardAmount}>
          +{reward.amount.toLocaleString("he-IL")}
        </Text>
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
