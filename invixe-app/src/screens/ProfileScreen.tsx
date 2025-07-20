import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import TopBar from '../components/ui/TopBar';
import BottomNavbar from '../components/ui/BottomNavbar';
import PageBackground from '../components/ui/PageBackground';
import theme from '../theme';
import { useUser } from '../context/UserContext';
import Svg, { Path, Circle } from 'react-native-svg';

// Gold coin SVG
const CoinIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 27 28" fill="none">
    <Path d="M13.5 27.0933C20.5416 27.0933 26.25 21.3849 26.25 14.3433C26.25 7.30163 20.5416 1.59326 13.5 1.59326C6.45837 1.59326 0.75 7.30163 0.75 14.3433C0.75 21.3849 6.45837 27.0933 13.5 27.0933Z" fill="#F4900C"/>
    <Path d="M13.5 0.593262C20.2655 0.593262 25.75 6.07777 25.75 12.8433C25.75 19.6087 20.2655 25.0933 13.5 25.0933C6.73451 25.0933 1.25 19.6087 1.25 12.8433C1.25 6.07777 6.73451 0.593262 13.5 0.593262Z" fill="#FFCC4D" stroke="#F4900C"/>
    <Path d="M13.5 24.0933C19.299 24.0933 24 19.3923 24 13.5933C24 7.79427 19.299 3.09326 13.5 3.09326C7.70101 3.09326 3 7.79427 3 13.5933C3 19.3923 7.70101 24.0933 13.5 24.0933Z" fill="#FFE8B6"/>
    <Path d="M13.5 23.3433C19.299 23.3433 24 18.6423 24 12.8433C24 7.04427 19.299 2.34326 13.5 2.34326C7.70101 2.34326 3 7.04427 3 12.8433C3 18.6423 7.70101 23.3433 13.5 23.3433Z" fill="#FFAC33"/>
    <Path d="M7.16016 8.23543C7.16016 7.82668 7.56141 7.66318 7.56141 7.66318L13.4699 4.88818L19.4347 7.66318C19.4347 7.66318 19.8457 7.75468 19.8457 8.23843V8.71918H7.16016V8.23543Z" fill="#FFE8B6"/>
  </Svg>
);

// Lightning icon
const LightningIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke="#FFD700"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
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

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { coins, lightnings, completedLessons } = useUser();
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

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('http://10.0.0.39:4000/api/user/portfolio');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      const data = await response.json();
      setPortfolio(data.portfolio || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockPrices = async () => {
    try {
      const symbols = portfolio.map(h => h.symbol).join(',');
      const response = await fetch(`http://10.0.0.39:4000/api/stocks/prices?symbols=${symbols}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock prices');
      }
      const data = await response.json();
      setStockPrices(data.prices || []);
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      // Mock data for demo
      const mockPrices = portfolio.map(holding => ({
        symbol: holding.symbol,
        price: 100 + Math.random() * 200,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5
      }));
      setStockPrices(mockPrices);
    }
  };

  // Updated getCurrentPrice: fallback to avgPrice if no price found
  const getCurrentPrice = (symbol: string, avgPrice: number) => {
    const priceData = stockPrices.find(p => p.symbol === symbol);
    // If no price found, fallback to avgPrice (so gain/loss is 0)
    return priceData?.price || avgPrice;
  };

  const getTotalValue = () => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = getCurrentPrice(holding.symbol, holding.avgPrice);
      return total + (holding.shares * currentPrice);
    }, 0);
  };

  const getTotalCost = () => {
    return portfolio.reduce((total, holding) => {
      return total + (holding.shares * holding.avgPrice);
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

  const handleTabPress = (tab: 'map' | 'profile' | 'shop' | 'graph') => {
    switch (tab) {
      case 'map':
        navigation.navigate('Map');
        break;
      case 'graph':
        navigation.navigate('Sandbox');
        break;
      case 'profile':
        // Already on profile screen, do nothing
        break;
      case 'shop':
        navigation.navigate('Shop');
        break;
    }
  };

  // --- Redesigned UI ---
  return (
    <View style={styles.container}> {/* Solid color background */}
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>פרופיל</Text>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <CoinIcon />
            <Text style={styles.statValue}>{String(coins)}</Text>
            <Text style={styles.statLabel}>מטבעות</Text>
          </View>
          <View style={styles.statCard}>
            <LightningIcon />
            <Text style={styles.statValue}>{String(lightnings)}</Text>
            <Text style={styles.statLabel}>ברקים</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{String(completedLessons.length)}</Text>
            <Text style={styles.statLabel}>שיעורים הושלמו</Text>
          </View>
        </View>
        {/* Portfolio Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>ערך כולל</Text>
            <Text style={styles.summaryValue}>${getTotalValue().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>רווח/הפסד</Text>
            <Text style={[styles.summaryValue, { color: getTotalGainLoss() >= 0 ? theme.colors.growthGreen : theme.colors.optimismOrange }]}>
              {getTotalGainLoss() >= 0 ? '+' : ''}${getTotalGainLoss().toFixed(2)}
            </Text>
            <Text style={[styles.summaryPercent, { color: getGainLossPercent() >= 0 ? theme.colors.growthGreen : theme.colors.optimismOrange }]}>
              {getGainLossPercent() >= 0 ? '+' : ''}{getGainLossPercent().toFixed(2)}%
            </Text>
          </View>
        </View>
        {/* Holdings List */}
        <Text style={styles.sectionTitle}>תיק השקעות</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primaryBlue} />
        ) : portfolio.length === 0 ? (
          <View style={styles.emptyPortfolio}>
            <Text style={styles.emptyText}>אין לך מניות עדיין</Text>
            <Text style={styles.emptySubtext}>עבור לגרף כדי לקנות מניות</Text>
          </View>
        ) : (
          <View style={styles.holdingsList}>
            {portfolio.map((holding) => {
              const currentPrice = getCurrentPrice(holding.symbol, holding.avgPrice);
              const totalValue = holding.shares * currentPrice;
              const gainLoss = totalValue - (holding.shares * holding.avgPrice);
              const gainLossPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
              // Format shares to up to 3 decimals, but remove trailing zeros
              const sharesDisplay = parseFloat(holding.shares.toFixed(3)).toString();

              return (
                <View key={holding.id} style={styles.holdingCard}>
                  <View style={styles.holdingHeader}>
                    <Text style={styles.holdingSymbol}>{String(holding.symbol)}</Text>
                    <Text style={styles.holdingShares}>{String(sharesDisplay)} מניות</Text>
                  </View>
                  <View style={styles.holdingDetails}>
                    <View style={styles.holdingPrice}>
                      <Text style={styles.priceLabel}>מחיר נוכחי</Text>
                      <Text style={styles.priceValue}>
                        {currentPrice ? `$${currentPrice.toFixed(2)}` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.holdingValue}>
                      <Text style={styles.valueLabel}>ערך כולל</Text>
                      <Text style={styles.valueAmount}>
                        {currentPrice ? `$${totalValue.toFixed(2)}` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.holdingGainLoss}>
                      <Text style={styles.gainLossLabel}>רווח/הפסד</Text>
                      <Text style={[styles.gainLossAmount, { color: gainLoss >= 0 ? theme.colors.growthGreen : theme.colors.optimismOrange }]}>
                        {currentPrice ? `${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)}` : 'N/A'}
                      </Text>
                      <Text style={[styles.gainLossPercent, { color: gainLossPercent >= 0 ? theme.colors.growthGreen : theme.colors.optimismOrange }]}>
                        {currentPrice ? `${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%` : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      <BottomNavbar activeTab="profile" onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3E9FF', // solid color like MapScreen
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.font.bold,
    color: '#125BA5',
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
    textShadowColor: '#0D2033',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: 8,
  },
  statCard: {
    backgroundColor: '#A0CFFF',
    borderRadius: 20,
    padding: theme.spacing.md,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: '#0D2033',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: '#125BA5',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: '#125BA5',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: '#0D2033',
  },
  summaryPercent: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: '#125BA5',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: '#125BA5',
    marginBottom: theme.spacing.md,
    textAlign: 'right',
  },
  emptyPortfolio: {
    backgroundColor: '#A0CFFF',
    borderRadius: 20,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: '#125BA5',
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: '#125BA5',
    opacity: 0.8,
  },
  holdingsList: {
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  holdingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: theme.spacing.md,
    marginBottom: 8,
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  holdingSymbol: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: '#0D2033',
  },
  holdingShares: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: '#125BA5',
  },
  holdingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  holdingPrice: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: '#125BA5',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: '#0D2033',
  },
  holdingValue: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: '#125BA5',
    marginBottom: 2,
  },
  valueAmount: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: '#0D2033',
  },
  holdingGainLoss: {
    alignItems: 'center',
    flex: 1,
  },
  gainLossLabel: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: '#125BA5',
    marginBottom: 2,
  },
  gainLossAmount: {
    fontSize: 15,
    fontFamily: theme.font.bold,
  },
  gainLossPercent: {
    fontSize: 13,
    fontFamily: theme.font.family,
  },
}); 