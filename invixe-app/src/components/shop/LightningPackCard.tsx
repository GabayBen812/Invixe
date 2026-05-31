import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import theme from "../../theme";
import type { LightningPack } from "../../data/shopCatalog";

type Props = {
  pack: LightningPack;
  width: number;
  onPress: () => void;
};

function BoltIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size * 0.7} height={size} viewBox="0 0 28 27" fill="none">
      <Path
        d="M17.6562 1.99915L12.9043 24.3312C12.7171 24.6127 12.4406 24.8234 12.1191 24.9279C11.7974 25.0324 11.4489 25.0243 11.1318 24.9064C10.815 24.7884 10.5472 24.5667 10.3721 24.2775C10.197 23.9882 10.1246 23.6481 10.167 23.3126L10.957 16.9991H7.65625C7.42338 16.9991 7.19363 16.9451 6.98535 16.8409C6.77713 16.7368 6.59576 16.5858 6.45605 16.3995C6.31639 16.2133 6.22234 15.9967 6.18066 15.7677C6.13902 15.5387 6.15067 15.3027 6.21582 15.0792L9.71582 3.07922C9.80668 2.76771 9.99629 2.49368 10.2559 2.29895C10.5155 2.10422 10.8317 1.99915 11.1562 1.99915H17.6562Z"
        fill="#62D24C"
        stroke="#368642"
      />
    </Svg>
  );
}

function BoltCluster({ count }: { count: 1 | 2 | 3 }) {
  if (count === 1) {
    return <BoltIcon size={40} />;
  }
  if (count === 2) {
    return (
      <View style={styles.clusterRow}>
        <BoltIcon size={32} />
        <BoltIcon size={32} />
      </View>
    );
  }
  return (
    <View style={styles.clusterGrid}>
      <BoltIcon size={26} />
      <BoltIcon size={26} />
      <BoltIcon size={26} />
      <BoltIcon size={26} />
    </View>
  );
}

export default function LightningPackCard({ pack, width, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.amount}>+{pack.amount}</Text>
      <View style={styles.artWrap}>
        <BoltCluster count={pack.boltCount} />
      </View>
      <View style={styles.priceButton}>
        <Text style={styles.priceText}>{pack.priceLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingTop: 16,
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: "center",
    marginEnd: 10,
    minHeight: 168,
  },
  pressed: {
    opacity: 0.92,
  },
  amount: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  artWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 64,
    marginVertical: 8,
  },
  priceButton: {
    width: "100%",
    backgroundColor: "#D1FADF",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  priceText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: "#027A48",
  },
  clusterRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  clusterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 64,
    justifyContent: "center",
    gap: 2,
  },
});
