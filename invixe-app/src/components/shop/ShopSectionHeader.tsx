import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import theme from "../../theme";

type IconKind = "cash" | "video";

type Props = {
  title: string;
  icon: IconKind;
};

function SectionIcon({ kind }: { kind: IconKind }) {
  if (kind === "cash") {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
          stroke="#12B76A"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke="#7C3AED" strokeWidth={2} />
      <Path d="M10 8.5l6 3.5-6 3.5V8.5z" fill="#7C3AED" />
    </Svg>
  );
}

export default function ShopSectionHeader({ title, icon }: Props) {
  return (
    <View style={styles.row}>
      <SectionIcon kind={icon} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
  },
});
