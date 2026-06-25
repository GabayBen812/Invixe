import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import PremiumPlusCard from "../components/shop/PremiumPlusCard";
import ShopSectionHeader from "../components/shop/ShopSectionHeader";
import CoinPackCard from "../components/shop/CoinPackCard";
import LightningPackCard from "../components/shop/LightningPackCard";
import AdRewardCard from "../components/shop/AdRewardCard";
import {
  COIN_PACKS,
  LIGHTNING_PACKS,
  AD_REWARDS,
  type CoinPack,
  type LightningPack,
  type AdReward,
} from "../data/shopCatalog";
import { useUser } from "../context/UserContext";
import theme from "../theme";
import Svg, { Path, Circle, Rect } from "react-native-svg";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;

const PACK_GAP = 10;
const HORIZONTAL_PADDING = 16;

export default function ShopScreen({ navigation }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const { coins, lightnings, setCoins, setLightnings } = useUser();

  const packCardWidth = useMemo(() => {
    const available = screenWidth - HORIZONTAL_PADDING * 2 - PACK_GAP * 2;
    return Math.floor(available / 3);
  }, [screenWidth]);

  const handleTabPress = (tab: "map" | "profile" | "graph") => {
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
    }
  };

  const handlePaidPurchase = (label: string) => {
    Alert.alert(
      "רכישה בקרוב",
      `${label} יהיה זמין לאחר חיבור תשלומי App Store / Google Play.`,
    );
  };

  const handleCoinPack = (pack: CoinPack) => {
    handlePaidPurchase(pack.title);
  };

  const handleLightningPack = (pack: LightningPack) => {
    handlePaidPurchase(`+${pack.amount} ברקים`);
  };

  const handleAdReward = (reward: AdReward) => {
    if (reward.kind === "coins") {
      setCoins(coins + reward.amount);
      Alert.alert("כל הכבוד!", `קיבלת ${reward.amount} מטבעות`);
    } else {
      setLightnings(lightnings + reward.amount);
      Alert.alert("כל הכבוד!", `קיבלת ${reward.amount} ברק`);
    }
  };

  const handlePremium = () => {
    Alert.alert(
      "Invixe+",
      "מנוי פרימיום יתווסף בגרסה הבאה — תוכן בלתי מוגבל, ללא פרסומות ועוד.",
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>חנות</Text>

        <PremiumPlusCard onUpgrade={handlePremium} />

        <ShopSectionHeader title="קנה כסף" icon="cash" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.packRow}
          style={styles.packScroller}
        >
          {COIN_PACKS.map((pack) => (
            <CoinPackCard
              key={pack.id}
              pack={pack}
              width={packCardWidth}
              onPress={() => handleCoinPack(pack)}
            />
          ))}
        </ScrollView>

        <ShopSectionHeader title="קנה ברקים" icon="lightning" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.packRow}
          style={styles.packScroller}
        >
          {LIGHTNING_PACKS.map((pack) => (
            <LightningPackCard
              key={pack.id}
              pack={pack}
              width={packCardWidth}
              onPress={() => handleLightningPack(pack)}
            />
          ))}
        </ScrollView>

        <ShopSectionHeader title="צפה בפרסומות וקבל" icon="video" />
        <View style={styles.adRow}>
          {AD_REWARDS.map((reward) => (
            <AdRewardCard
              key={reward.id}
              reward={reward}
              onWatch={() => handleAdReward(reward)}
            />
          ))}
        </View>

        <View style={styles.secureFooter}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M7 11V8a5 5 0 0 1 10 0v3"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Rect
              x={5}
              y={11}
              width={14}
              height={10}
              rx={2}
              stroke="#94A3B8"
              strokeWidth={2}
            />
            <Circle cx={12} cy={15} r={1.5} fill="#94A3B8" />
          </Svg>
          <Text style={styles.secureText}>
            הרכישות שלך מאובטחות ומוצפנות
          </Text>
        </View>
      </ScrollView>

      <BottomNavbar activeTab="map" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  packScroller: {
    marginBottom: 8,
    marginHorizontal: -HORIZONTAL_PADDING,
  },
  packRow: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 4,
  },
  adRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  secureFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  secureText: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "center",
  },
});
