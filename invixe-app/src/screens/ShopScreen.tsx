import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { openMapFromTab } from "../navigation/mapNavigation";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import ShopSectionHeader from "../components/shop/ShopSectionHeader";
import AdRewardCard from "../components/shop/AdRewardCard";
import { getShopAdRewards } from "../data/shopCatalog";
import { useUser } from "../context/UserContext";
import { formatMoney } from "../utils/money";
import theme from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;

const HORIZONTAL_PADDING = 16;

export default function ShopScreen({ navigation }: Props) {
  const { addCash, currentUserEmail, isGuest } = useUser();
  const adRewards = getShopAdRewards();
  const adAmount = adRewards[0]?.amount ?? 0;

  const handleTabPress = (tab: "map" | "profile" | "graph") => {
    switch (tab) {
      case "map":
        openMapFromTab(navigation);
        break;
      case "graph":
        navigation.navigate("Sandbox");
        break;
      case "profile":
        navigation.navigate("Profile");
        break;
    }
  };

  const handleAdReward = async () => {
    if (!currentUserEmail || isGuest) {
      Alert.alert(
        "נדרש חשבון",
        "יש להירשם או להתחבר כדי לקבל מזומן ולשמור התקדמות.",
      );
      return;
    }
    try {
      await addCash(adAmount);
      Alert.alert("כל הכבוד!", `קיבלת ${formatMoney(adAmount)} מזומן`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Network error";
      Alert.alert("שגיאה", message);
    }
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

        <ShopSectionHeader title="צפה בפרסומות וקבל מזומן" icon="video" />
        <View style={styles.adRow}>
          {adRewards.map((reward) => (
            <AdRewardCard
              key={reward.id}
              reward={reward}
              onWatch={() => {
                void handleAdReward();
              }}
            />
          ))}
        </View>

        <Text style={styles.hint}>
          צבור מזומן לקניית מניות בתיק ההשקעות שלך
        </Text>
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
  adRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  hint: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "center",
    marginTop: 8,
  },
});
