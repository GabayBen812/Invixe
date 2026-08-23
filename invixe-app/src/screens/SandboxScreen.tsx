import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { openMapFromTab } from '../navigation/mapNavigation';
import TopBar from '../components/ui/TopBar';
import BottomNavbar from '../components/ui/BottomNavbar';
import theme from '../theme';
import { useUser } from '../context/UserContext';
import { usePortfolio } from '../context/PortfolioContext';
import { API_BASE_URL } from '../config/api';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { formatMoney } from '../utils/money';
import { fetchLiveStockQuote } from '../utils/stockQuote';
import TradingHeader from '../components/trading/TradingHeader';
import TradingControlsBar from '../components/trading/TradingControlsBar';
import TradingActionDock from '../components/trading/TradingActionDock';
import TradingSmaToggle from '../components/trading/TradingSmaToggle';
import { buildTradingViewHtml } from '../components/trading/tradingChartHtml';
import TradingTickerOverlay from '../components/trading/TradingTickerOverlay';
import TradingSimulationDisclaimer from '../components/trading/TradingSimulationDisclaimer';
import { alertGuestFeatureBlocked } from '../utils/guestMode';
import GuestModeBanner from '../components/auth/GuestModeBanner';
import { WebView } from 'react-native-webview';

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
];

function resolveStock(symbol: string) {
  const upper = symbol.toUpperCase();
  return (
    STOCKS.find((s) => s.symbol === upper) ?? {
      symbol: upper,
      name: upper,
    }
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'Sandbox'>;

async function readApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error === 'Insufficient coins') return 'אין לך מספיק מזומן';
    if (data?.error === 'Insufficient shares') return 'אין לך מספיק מניות למכירה';
    if (typeof data?.error === 'string' && data.error.length > 0) {
      return data.error;
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

function mapRangeToTv(range: string) {
  switch (range) {
    case '1h': return '60';
    case '1d': return 'D';
    case '1w': return 'W';
    case '1mo': return 'M';
    default: return 'D';
  }
}

export default function SandboxScreen({ navigation, route }: Props) {
  const { cash, setCash, currentUserEmail, isGuest } = useUser();
  const { getHolding, refreshPortfolio } = usePortfolio();
  const initialSymbol = route.params?.symbol;
  const [selectedStock, setSelectedStock] = useState(() =>
    initialSymbol ? resolveStock(initialSymbol) : STOCKS[0],
  );
  const [selectedRange, setSelectedRange] = useState('1d');
  const [sma150Enabled, setSma150Enabled] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const webViewBaseRef = useRef<WebView>(null);
  const webViewSmaRef = useRef<WebView>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveChangePercent, setLiveChangePercent] = useState<number | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeShares, setTradeShares] = useState('');
  const [isTrading, setIsTrading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(16)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const smaReveal = useRef(new Animated.Value(0)).current;
  const smaChipReveal = useRef(new Animated.Value(0)).current;
  const chartQuoteActiveRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      void refreshPortfolio();
    }, [refreshPortfolio]),
  );

  useEffect(() => {
    if (route.params?.symbol) {
      setSelectedStock(resolveStock(route.params.symbol));
    }
  }, [route.params?.symbol]);

  const loadQuote = useCallback(
    async (symbol: string) => {
      if (chartQuoteActiveRef.current) return;

      const quote = await fetchLiveStockQuote(symbol);
      if (quote && quote.price > 0) {
        setLivePrice(quote.price);
        setLiveChangePercent(quote.changePercent);
      }
    },
    [],
  );

  useEffect(() => {
    chartQuoteActiveRef.current = false;
    setLivePrice(null);
    setLiveChangePercent(null);
    void loadQuote(selectedStock.symbol);
    const interval = setInterval(() => {
      void loadQuote(selectedStock.symbol);
    }, 20_000);
    return () => clearInterval(interval);
  }, [selectedStock.symbol, loadQuote]);

  const postToChart = useCallback((payload: Record<string, unknown>) => {
    const json = JSON.stringify(payload);
    const script = `(function(){try{if(window.handleChartCommand){window.handleChartCommand(${json});}}catch(e){}})();true;`;
    try {
      webViewBaseRef.current?.injectJavaScript(script);
      webViewSmaRef.current?.injectJavaScript(script);
    } catch {
      // webview not ready
    }
  }, []);

  const toggleSma150 = useCallback(() => {
    setSma150Enabled((prev) => {
      const next = !prev;
      Animated.timing(smaReveal, {
        toValue: next ? 1 : 0,
        duration: 240,
        useNativeDriver: true,
      }).start();
      return next;
    });
  }, [smaReveal]);

  useEffect(() => {
    setChartReady(false);
    smaChipReveal.setValue(0);
    // TradingView free widget sometimes never posts `ready` — still reveal the chip
    const fallback = setTimeout(() => setChartReady(true), 1600);
    return () => clearTimeout(fallback);
  }, [selectedStock.symbol, selectedRange, smaChipReveal]);

  useEffect(() => {
    if (!chartReady) return;
    Animated.spring(smaChipReveal, {
      toValue: 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [chartReady, smaChipReveal]);

  useEffect(() => {
    postToChart({
      type: 'setSymbol',
      symbol: selectedStock.symbol,
      interval: mapRangeToTv(selectedRange),
    });
  }, [selectedStock.symbol, postToChart]);

  useEffect(() => {
    postToChart({
      type: 'setInterval',
      interval: mapRangeToTv(selectedRange),
    });
  }, [selectedRange, postToChart]);

  const currentHolding = useMemo(
    () => getHolding(selectedStock.symbol),
    [getHolding, selectedStock.symbol],
  );

  const maxBuyShares = useMemo(() => {
    if (!livePrice || livePrice <= 0) return 0;
    return Math.floor(cash / livePrice);
  }, [cash, livePrice]);

  const maxSellShares = currentHolding?.shares ?? 0;

  const tradeTotal = useMemo(() => {
    const shares = parseFloat(tradeShares);
    if (!livePrice || isNaN(shares) || shares <= 0) return 0;
    return shares * livePrice;
  }, [tradeShares, livePrice]);

  const selectStockSymbol = useCallback(
    (symbol: string) => {
      const stock = resolveStock(symbol);
      setSelectedStock(stock);
    },
    [],
  );

  const showToast = useCallback(
    (message: string, type: 'success' | 'error') => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastOpacity.setValue(0);
      toastTranslateY.setValue(16);
      setToast({ message, type });
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
      toastTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
          Animated.timing(toastTranslateY, { toValue: 16, duration: 260, useNativeDriver: true }),
        ]).start(() => setToast(null));
      }, 3200);
    },
    [toastOpacity, toastTranslateY],
  );

  const handleTabPress = (tab: 'map' | 'profile' | 'graph') => {
    switch (tab) {
      case 'map':
        openMapFromTab(navigation);
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'graph':
        break;
    }
  };

  const openTradeModal = (type: 'buy' | 'sell') => {
    if (isGuest) {
      alertGuestFeatureBlocked('מסחר (קנייה ומכירה)', navigation);
      return;
    }
    if (!livePrice) {
      void loadQuote(selectedStock.symbol);
    }
    setTradeType(type);
    setTradeShares('');
    setShowTradeModal(true);
  };

  const setQuickShares = (shares: number) => {
    if (shares > 0) setTradeShares(String(shares));
  };

  const handleTrade = async () => {
    const shares = Math.floor(parseFloat(tradeShares.replace(/,/g, '.')));
    if (!tradeShares.trim() || isNaN(shares) || shares <= 0) {
      showToast('אנא הכנס מספר מניות תקין', 'error');
      return;
    }

    let price = livePrice;
    if (!price || price <= 0) {
      const quote = await fetchLiveStockQuote(selectedStock.symbol);
      if (quote?.price) {
        price = quote.price;
        setLivePrice(quote.price);
        setLiveChangePercent(quote.changePercent);
      }
    }
    if (!price || price <= 0) {
      showToast('לא הצלחנו לטעון את מחיר המניה. נסה שוב בעוד רגע.', 'error');
      return;
    }

    const totalCost = Math.round(shares * price * 100) / 100;

    if (tradeType === 'buy' && cash < totalCost) {
      showToast('אין לך מספיק מזומן', 'error');
      return;
    }
    if (tradeType === 'sell') {
      const holding = getHolding(selectedStock.symbol);
      if (!holding || holding.shares < shares) {
        showToast('אין לך מספיק מניות למכירה', 'error');
        return;
      }
    }

    setIsTrading(true);
    try {
      const endpoint = tradeType === 'buy'
        ? `${API_BASE_URL}/user/portfolio/buy`
        : `${API_BASE_URL}/user/portfolio/sell`;

      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUserEmail ?? undefined,
          symbol: selectedStock.symbol,
          shares,
          price,
        }),
      });

      if (!response.ok) {
        const message = await readApiError(
          response,
          tradeType === 'buy' ? 'שגיאה בקניית המניות' : 'שגיאה במכירת המניות',
        );
        throw new Error(message);
      }

      const data = await response.json();
      if (typeof data.newCoins === 'number') {
        setCash(data.newCoins);
      }

      setShowTradeModal(false);
      setTradeShares('');
      showToast(
        tradeType === 'buy'
          ? `קנית ${shares} מניות של ${selectedStock.symbol}`
          : `מכרת ${shares} מניות של ${selectedStock.symbol}`,
        'success',
      );

      void refreshPortfolio();
    } catch (error) {
      const message = error instanceof Error ? error.message
        : tradeType === 'buy' ? 'שגיאה בקניית המניות' : 'שגיאה במכירת המניות';
      showToast(message, 'error');
    } finally {
      setIsTrading(false);
    }
  };

  const chartBgColor = theme.colors.surface.darkBg;
  const candleUpColor = theme.colors.growthGreen;
  const candleDownColor = theme.colors.optimismOrange;
  const gridColor = 'rgba(63, 159, 255, 0.12)';
  const tvInterval = mapRangeToTv(selectedRange);

  const buildTvHtml = useCallback(
    (withSma: boolean) =>
      buildTradingViewHtml({
        symbol: selectedStock.symbol,
        interval: tvInterval,
        withSma,
        chartBgColor,
        candleUpColor,
        candleDownColor,
        gridColor,
      }),
    [
      candleDownColor,
      candleUpColor,
      chartBgColor,
      gridColor,
      selectedStock.symbol,
      tvInterval,
    ],
  );

  const tvHtmlBase = useMemo(() => buildTvHtml(false), [buildTvHtml]);
  const tvHtmlSma = useMemo(() => buildTvHtml(true), [buildTvHtml]);

  const handleChartMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data || '{}');
        if (data.type === 'ready') {
          setChartReady(true);
          return;
        }
        if (
          data.type === 'quote' &&
          data.symbol &&
          data.price &&
          String(data.symbol).toUpperCase() === selectedStock.symbol.toUpperCase()
        ) {
          chartQuoteActiveRef.current = true;
          setChartReady(true);
          setLivePrice(Number(data.price));
          if (data.changePercent != null) {
            setLiveChangePercent(Number(data.changePercent));
          }
        }
      } catch {
        // ignore malformed messages
      }
    },
    [selectedStock.symbol, showToast],
  );

  return (
    <View style={styles.container}>
      <TopBar />
      {isGuest ? <GuestModeBanner navigation={navigation} /> : null}
      <TradingHeader
        symbol={selectedStock.symbol}
        stockName={selectedStock.name}
        livePrice={livePrice}
        liveChangePercent={liveChangePercent}
      />
      <TradingControlsBar
        selectedSymbol={selectedStock.symbol}
        selectedRange={selectedRange}
        onSelectSymbol={selectStockSymbol}
        onSelectRange={setSelectedRange}
      />

      <View style={styles.chartArea}>
        <WebView
          key={`base-${selectedStock.symbol}-${selectedRange}`}
          ref={webViewBaseRef}
          originWhitelist={['*']}
          source={{ html: tvHtmlBase }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          nestedScrollEnabled
          overScrollMode="never"
          style={styles.chart}
          allowsInlineMediaPlayback
          onMessage={handleChartMessage}
        />
        <Animated.View
          // Receive drags on the SMA chart when it's visible; pass through when hidden
          pointerEvents={sma150Enabled ? 'auto' : 'none'}
          style={[styles.chartOverlay, { opacity: smaReveal }]}
        >
          <WebView
            key={`sma-${selectedStock.symbol}-${selectedRange}`}
            ref={webViewSmaRef}
            originWhitelist={['*']}
            source={{ html: tvHtmlSma }}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            bounces={false}
            nestedScrollEnabled
            overScrollMode="never"
            style={styles.chart}
            allowsInlineMediaPlayback
            onMessage={handleChartMessage}
          />
        </Animated.View>
        <Animated.View
          pointerEvents={chartReady ? 'box-none' : 'none'}
          style={[
            styles.chartTools,
            {
              opacity: smaChipReveal,
              transform: [
                {
                  translateY: smaChipReveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
                {
                  scale: smaChipReveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.86, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TradingSmaToggle
            enabled={sma150Enabled}
            onToggle={toggleSma150}
          />
        </Animated.View>
        <TradingTickerOverlay
          symbol={selectedStock.symbol}
          stockName={selectedStock.name}
          livePrice={livePrice}
          liveChangePercent={liveChangePercent}
          sharesHeld={currentHolding?.shares ?? 0}
          avgPrice={currentHolding?.avgPrice ?? 0}
          cash={cash}
          visible={chartReady || livePrice != null}
        />
      </View>

      <TradingSimulationDisclaimer />

      <TradingActionDock
        sellShares={maxSellShares}
        locked={isGuest}
        onBuy={() => openTradeModal('buy')}
        onSell={() => openTradeModal('sell')}
      />

      <BottomNavbar activeTab="graph" onTabPress={handleTabPress} />

      <Modal
        visible={showTradeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {tradeType === 'buy' ? 'קניית מניות' : 'מכירת מניות'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedStock.symbol} · {selectedStock.name}
            </Text>
            <Text style={styles.modalPrice}>
              מחיר: {livePrice ? formatMoney(livePrice) : '—'}
            </Text>

            <View style={styles.modalBalanceRow}>
              <Text style={styles.modalBalanceLabel}>מזומן זמין</Text>
              <Text style={styles.modalBalanceValue}>{formatMoney(cash)}</Text>
            </View>
            {tradeType === 'sell' && currentHolding && (
              <View style={styles.modalBalanceRow}>
                <Text style={styles.modalBalanceLabel}>מניות בתיק</Text>
                <Text style={styles.modalBalanceValue}>{currentHolding.shares}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>כמות מניות</Text>
              <TextInput
                style={styles.textInput}
                value={tradeShares}
                onChangeText={setTradeShares}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.quickRow}>
              {tradeType === 'buy' ? (
                <>
                  <TouchableOpacity style={styles.quickChip} onPress={() => setQuickShares(1)}>
                    <Text style={styles.quickChipText}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickChip} onPress={() => setQuickShares(5)}>
                    <Text style={styles.quickChipText}>5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickChip}
                    onPress={() => setQuickShares(maxBuyShares)}
                    disabled={maxBuyShares <= 0}
                  >
                    <Text style={styles.quickChipText}>מקס׳</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.quickChip} onPress={() => setQuickShares(1)}>
                    <Text style={styles.quickChipText}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickChip}
                    onPress={() => setQuickShares(Math.floor(maxSellShares / 2))}
                    disabled={maxSellShares <= 0}
                  >
                    <Text style={styles.quickChipText}>חצי</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickChip}
                    onPress={() => setQuickShares(maxSellShares)}
                    disabled={maxSellShares <= 0}
                  >
                    <Text style={styles.quickChipText}>הכל</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {tradeTotal > 0 && (
              <View style={styles.costInfo}>
                <Text style={styles.costLabel}>
                  {tradeType === 'buy' ? 'עלות משוערת' : 'תקבל בערך'}
                </Text>
                <Text style={styles.costValue}>{formatMoney(tradeTotal)}</Text>
              </View>
            )}

            <TradingSimulationDisclaimer compact />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, isTrading && styles.buttonDisabled]}
                onPress={() => {
                  setShowTradeModal(false);
                  setTradeShares('');
                }}
                disabled={isTrading}
              >
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  tradeType === 'buy' ? styles.confirmBuy : styles.confirmSell,
                  isTrading && styles.buttonDisabled,
                ]}
                onPress={handleTrade}
                disabled={isTrading}
              >
                {isTrading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {tradeType === 'buy' ? 'אשר קנייה' : 'אשר מכירה'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {toast && (
        <Animated.View
          style={[
            styles.toast,
            toast.type === 'success' ? styles.toastSuccess : styles.toastError,
            { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] },
          ]}
          pointerEvents="none"
        >
          <View style={[styles.toastIconWrap, toast.type === 'success' ? styles.toastIconSuccess : styles.toastIconError]}>
            <Text style={styles.toastIconText}>{toast.type === 'success' ? '✓' : '✕'}</Text>
          </View>
          <Text style={styles.toastMessage}>{toast.message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  chartArea: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: theme.colors.surface.darkBg,
    position: 'relative',
  },
  chartOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  chart: {
    flex: 1,
    backgroundColor: theme.colors.surface.darkBg,
  },
  chartTools: {
    position: 'absolute',
    right: 72,
    bottom: 42,
    zIndex: 5,
    elevation: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: '#0F2233',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: '#0F2233',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalBalanceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  modalBalanceValue: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: '#0F2233',
  },
  inputContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'right',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: theme.font.bold,
    textAlign: 'center',
    color: '#0F2233',
    backgroundColor: '#F8FAFC',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  quickChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  quickChipText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: '#475569',
  },
  costInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  costLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  costValue: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: '#0F2233',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: '#475569',
  },
  confirmBuy: {
    backgroundColor: theme.colors.growthGreen,
  },
  confirmSell: {
    backgroundColor: theme.colors.error[600],
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  toast: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  toastSuccess: {
    backgroundColor: theme.colors.surface.darkBg,
  },
  toastError: {
    backgroundColor: theme.colors.surface.darkBg,
  },
  toastIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastIconSuccess: {
    backgroundColor: theme.colors.growthGreen,
  },
  toastIconError: {
    backgroundColor: theme.colors.error[600],
  },
  toastIconText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: theme.font.bold,
  },
  toastMessage: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: '#FFFFFF',
    textAlign: 'right',
  },
});
