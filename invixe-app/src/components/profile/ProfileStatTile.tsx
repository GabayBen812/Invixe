import React from "react";
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import theme from "../../theme";

type Props = {
  icon: React.ReactNode;
  iconBackground: string;
  label: string;
  value: string;
  style?: StyleProp<ViewStyle>;
};

export default function ProfileStatTile({
  icon,
  iconBackground,
  label,
  value,
  style,
}: Props) {
  return (
    <View style={[styles.cell, style]}>
      <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
        {icon}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: "50%",
    minHeight: 118,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "center",
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
});
