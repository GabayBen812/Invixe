import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import theme from "../theme";
import Svg, { Path, Circle } from "react-native-svg";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;

// TBD / construction-style icon: open box with sparkle
const TBDIcon = ({ size = 120 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <Circle cx="60" cy="60" r="54" stroke={theme.colors.primary[400]} strokeWidth="2" strokeDasharray="8 6" fill="transparent" />
    <Circle cx="60" cy="60" r="42" stroke={theme.colors.primary[400]} strokeWidth="1.5" strokeDasharray="6 4" fill="transparent" opacity={0.6} />
    <Path
      d="M40 52 L60 38 L80 52 L80 72 L60 86 L40 72 Z"
      stroke={theme.colors.primary[500]}
      strokeWidth="2.5"
      fill="none"
      strokeLinejoin="round"
    />
    <Path d="M60 38 L60 86" stroke={theme.colors.primary[500]} strokeWidth="2" strokeDasharray="4 3" />
    <Path d="M40 52 L80 52" stroke={theme.colors.primary[500]} strokeWidth="2" strokeDasharray="4 3" />
    <Circle cx="60" cy="62" r="6" fill={theme.colors.primary[400]} opacity={0.9} />
  </Svg>
);

export default function ShopScreen({ navigation }: Props) {
  const handleTabPress = (tab: "map" | "profile" | "shop" | "graph") => {
    switch (tab) {
      case "map":
        navigation.navigate("Map");
        break;
      case "graph":
        navigation.navigate("Sandbox");
        break;
      case "profile":
        navigation.navigate("Profile");
        break;
      case "shop":
        break;
    }
  };

  return (
    <View style={styles.container}>
      <TopBar />

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <TBDIcon size={120} />
        </View>
        <Text style={styles.badge}>TBD</Text>
        <Text style={styles.title}>החנות בדרך</Text>
        <Text style={styles.message}>
          אין כאן עדיין כלום – אנחנו עובדים על משהו מגניב. הישאר מעודכן ונעדכן כשיהיה מוכן.
        </Text>
        <View style={styles.footerNote}>
          <View style={styles.dot} />
          <Text style={styles.footerText}>בקרוב כאן</Text>
          <View style={styles.dot} />
        </View>
      </View>

      <BottomNavbar activeTab="shop" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3EEF9",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  iconWrap: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 3,
    color: theme.colors.primary[500],
    marginBottom: 12,
    fontFamily: "NotoSansHebrew",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 14,
    textAlign: "center",
    fontFamily: "NotoSansHebrew",
  },
  message: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.8,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 320,
    fontFamily: "NotoSansHebrew",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary[400],
    opacity: 0.7,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary[500],
    fontFamily: "NotoSansHebrew",
  },
}); 