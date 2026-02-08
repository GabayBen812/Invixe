import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import TopBar from "../components/ui/TopBar";
import BottomNavbar from "../components/ui/BottomNavbar";
import theme from "../theme";
import { useUser } from "../context/UserContext";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { API_BASE_URL } from "../config/api";

// --- Icons ---

const FireIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c4.97 0 9-4.03 9-9c0-4.97-9-13-9-13S3 8.03 3 13c0 4.97 4.03 9 9 9z"
      fill="#FFA000"
    />
    <Path
      d="M12 18c2.21 0 4-1.79 4-4c0-2.21-4-7-4-7s-4 4.79-4 7c0 2.21 1.79 4 4 4z"
      fill="#FFCA28"
    />
  </Svg>
);

const LessonsIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 11h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm10 0h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zM4 21h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm13 0c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4z"
      fill="#4285F4"
    />
  </Svg>
);

const BookIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"
      fill="#5C6BC0"
    />
  </Svg>
);

interface PortfolioHolding {
  id: string;
  symbol: string;
  shares: number;
  avgPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const { coins, lightnings, completedLessons, logout, currentUserEmail } =
    useUser();
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [stockPrices, setStockPrices] = useState<StockPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  useEffect(() => {
    if (portfolio.length > 0) {
      fetchStockPrices();
    }
  }, [portfolio]);

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/portfolio`);
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }
      const data = await response.json();
      setPortfolio(data.portfolio || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockPrices = async () => {
    try {
      const symbols = portfolio.map((h) => h.symbol).join(",");
      const response = await fetch(
        `${API_BASE_URL}/stocks/prices?symbols=${symbols}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch stock prices");
      }
      const data = await response.json();
      setStockPrices(data.prices || []);
    } catch (error) {
      console.error("Error fetching stock prices:", error);
      // Mock data for demo
      const mockPrices = portfolio.map((holding) => ({
        symbol: holding.symbol,
        price: 100 + Math.random() * 200,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
      }));
      setStockPrices(mockPrices);
    }
  };

  // Updated getCurrentPrice: fallback to avgPrice if no price found
  const getCurrentPrice = (symbol: string, avgPrice: number) => {
    const priceData = stockPrices.find((p) => p.symbol === symbol);
    // If no price found, fallback to avgPrice (so gain/loss is 0)
    return priceData?.price || avgPrice;
  };

  const getTotalValue = () => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = getCurrentPrice(holding.symbol, holding.avgPrice);
      return total + holding.shares * currentPrice;
    }, 0);
  };

  const getTotalCost = () => {
    return portfolio.reduce((total, holding) => {
      return total + holding.shares * holding.avgPrice;
    }, 0);
  };

  const getTotalGainLoss = () => {
    const totalValue = getTotalValue();
    const totalCost = getTotalCost();
    return totalValue - totalCost;
  };

  const getGainLossPercent = () => {
    const totalCost = getTotalCost();
    if (totalCost === 0) return 0;
    return (getTotalGainLoss() / totalCost) * 100;
  };

  const handleTabPress = (tab: "map" | "profile" | "shop" | "graph") => {
    switch (tab) {
      case "map":
        navigation.navigate("Map", {});
        break;
      case "graph":
        navigation.navigate("Sandbox");
        break;
      case "profile":
        // Already on profile screen, do nothing
        break;
      case "shop":
        navigation.navigate("Shop");
        break;
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const userName = "יונתן אסייג"; // Mock for now or derive from email if available
  const userInitials = "יא";
  const streakDays = 12; // Mock

  // --- Redesigned UI ---
  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>Beginner Investor</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <FireIcon />
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>רצף ימים</Text>
          </View>
          <View style={styles.statCard}>
            <LessonsIcon />
            <Text style={styles.statValue}>{completedLessons.length}</Text>
            <Text style={styles.statLabel}>שיעורים</Text>
          </View>
          <View style={styles.statCard}>
            <BookIcon />
            <Text style={styles.statValue}>64</Text>
            {/* Mocking Terms count for now as per design */}
            <Text style={styles.statLabel}>מושגים</Text>
          </View>
        </View>

        {/* Portfolio Section */}
        <View style={styles.portfolioContainer}>
          <View style={styles.portfolioHeader}>
            <View>
              <Text style={styles.portfolioTitle}>תיק ההשקעות שלך</Text>
              <Text style={styles.portfolioSubtitle}>תיק לימודי מדמה</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.portfolioTotalValue}>
                $
                {getTotalValue().toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Text>
              <Text
                style={[
                  styles.portfolioGrowth,
                  { color: getTotalGainLoss() >= 0 ? "#12B76A" : "#F04438" },
                ]}
              >
                {getTotalGainLoss() >= 0 ? "+" : ""}
                {getGainLossPercent().toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primaryBlue}
              style={{ marginTop: 20 }}
            />
          ) : portfolio.length === 0 ? (
            <View style={styles.emptyPortfolio}>
              <Text style={styles.emptyText}>אין לך מניות עדיין</Text>
              <Text style={styles.emptySubtext}>עבור לגרף כדי לקנות מניות</Text>
            </View>
          ) : (
            <View style={styles.holdingsList}>
              {portfolio.map((holding) => {
                const currentPrice = getCurrentPrice(
                  holding.symbol,
                  holding.avgPrice,
                );
                const gainLossPercent =
                  ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
                const isPositive = gainLossPercent >= 0;

                return (
                  <View key={holding.id} style={styles.holdingItem}>
                    {/* Symbol Circle */}
                    <View
                      style={[
                        styles.symbolCircle,
                        { backgroundColor: isPositive ? "#E8F5E9" : "#FFEBEE" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.symbolInitial,
                          { color: isPositive ? "#1B5E20" : "#B71C1C" },
                        ]}
                      >
                        {holding.symbol.charAt(0)}
                        {holding.symbol.charAt(1)}
                      </Text>
                    </View>

                    {/* Info */}
                    <View style={styles.holdingInfo}>
                      <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
                      <Text style={styles.holdingShares}>
                        {holding.shares} מניות
                      </Text>
                    </View>

                    {/* Change */}
                    <View style={styles.holdingChange}>
                      <Text
                        style={[
                          styles.changeText,
                          { color: isPositive ? "#12B76A" : "#F04438" },
                        ]}
                      >
                        {isPositive ? "+" : ""}
                        {gainLossPercent.toFixed(1)}%
                      </Text>
                      <Text style={styles.chevron}>›</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>התנתק</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavbar activeTab="profile" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3EEF9", // Light blue background
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between", // Space between info and avatar
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  headerInfo: {
    flex: 1,
    alignItems: "flex-end", // Align text to right for Hebrew
    marginRight: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800", // Heavy bold
    color: "#0D2033",
    textAlign: "right",
  },
  userRole: {
    fontSize: 16,
    color: "#F79009", // Orange color
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0D2033", // Dark background
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0D2033",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0D2033",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
    textTransform: "uppercase",
  },
  portfolioContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#0D2033",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  portfolioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  portfolioTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0D2033",
    marginBottom: 4,
    textAlign: "right",
  },
  portfolioSubtitle: {
    fontSize: 14,
    color: "#98A2B3",
    fontWeight: "500",
    textAlign: "right",
  },
  portfolioTotalValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0D2033",
    marginBottom: 4,
  },
  portfolioGrowth: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAECF0",
    marginBottom: 16,
  },
  holdingsList: {
    gap: 12,
  },
  holdingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  symbolCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16, // Changed from marginRight to marginLeft for RTL
  },
  symbolInitial: {
    fontSize: 18,
    fontWeight: "700",
  },
  holdingInfo: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 16,
  },
  holdingSymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D2033",
    textAlign: "right",
  },
  holdingShares: {
    fontSize: 13,
    color: "#667085",
    marginTop: 2,
    textAlign: "right",
  },
  holdingChange: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeText: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: "#D0D5DD",
    fontWeight: "400",
  },
  emptyPortfolio: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D2033",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#667085",
  },
  logoutBtn: {
    alignSelf: "center",
    marginTop: 10,
  },
  logoutText: {
    color: "#D92D20",
    fontSize: 16,
    fontWeight: "600",
  },
});
