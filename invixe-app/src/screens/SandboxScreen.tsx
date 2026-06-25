import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import TopBar from '../components/ui/TopBar';
import BottomNavbar from '../components/ui/BottomNavbar';
import theme from '../theme';
import { useUser } from '../context/UserContext';
import { usePortfolio } from '../context/PortfolioContext';
import { API_BASE_URL } from '../config/api';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { formatUsd } from '../utils/portfolioNormalize';
import { fetchLiveStockQuote } from '../utils/stockQuote';
import TradingHeader from '../components/trading/TradingHeader';
import TradingControlsBar from '../components/trading/TradingControlsBar';
import TradingActionDock from '../components/trading/TradingActionDock';
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
    if (data?.error === 'Insufficient coins') return 'אין לך מספיק מטבעות';
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
  const { coins, setCoins, currentUserEmail } = useUser();
  const { getHolding, getQuote, getCurrentPrice, refreshPortfolio } = usePortfolio();
  const initialSymbol = route.params?.symbol;
  const [selectedStock, setSelectedStock] = useState(() =>
    initialSymbol ? resolveStock(initialSymbol) : STOCKS[0],
  );
  const [selectedRange, setSelectedRange] = useState('1d');
  const webViewRef = useRef<WebView>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveChangePercent, setLiveChangePercent] = useState<number | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeShares, setTradeShares] = useState('');

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
      const quote = await fetchLiveStockQuote(symbol);
      if (quote) {
        setLivePrice(quote.price);
        setLiveChangePercent(quote.changePercent);
        return;
      }

      const cachedPrice = getCurrentPrice(symbol);
      if (cachedPrice > 0) {
        setLivePrice(cachedPrice);
        const cachedQuote = getQuote(symbol);
        if (cachedQuote?.changePercent != null) {
          setLiveChangePercent(cachedQuote.changePercent);
        }
      }
    },
    [getCurrentPrice, getQuote],
  );

  useEffect(() => {
    setLivePrice(null);
    setLiveChangePercent(null);
    void loadQuote(selectedStock.symbol);
    const interval = setInterval(() => {
      void loadQuote(selectedStock.symbol);
    }, 20_000);
    return () => clearInterval(interval);
  }, [selectedStock.symbol, loadQuote]);

  useEffect(() => {
    try {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: 'setSymbol',
          symbol: selectedStock.symbol,
          interval: mapRangeToTv(selectedRange),
        }),
      );
    } catch {
      // webview not ready
    }
  }, [selectedStock.symbol]);

  useEffect(() => {
    try {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: 'setInterval',
          interval: mapRangeToTv(selectedRange),
        }),
      );
    } catch {
      // webview not ready
    }
  }, [selectedRange]);

  const currentHolding = useMemo(
    () => getHolding(selectedStock.symbol),
    [getHolding, selectedStock.symbol],
  );

  const maxBuyShares = useMemo(() => {
    if (!livePrice || livePrice <= 0) return 0;
    return Math.floor(coins / livePrice);
  }, [coins, livePrice]);

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

  const handleTabPress = (tab: 'map' | 'profile' | 'graph') => {
    switch (tab) {
      case 'map':
        navigation.navigate('Map');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'graph':
        break;
    }
  };

  const openTradeModal = (type: 'buy' | 'sell') => {
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
    let price = livePrice;
    if (!price || price <= 0) {
      const quote = await fetchLiveStockQuote(selectedStock.symbol);
      if (quote?.price) {
        price = quote.price;
        setLivePrice(quote.price);
        setLiveChangePercent(quote.changePercent);
      }
    }

    const shares = Math.floor(parseFloat(tradeShares.replace(/,/g, '.')));
    if (!price || price <= 0) {
      Alert.alert('שגיאה', 'לא הצלחנו לטעון את מחיר המניה. נסה שוב בעוד רגע.');
      return;
    }
    if (!tradeShares.trim() || isNaN(shares) || shares <= 0) {
      Alert.alert('שגיאה', 'אנא הכנס מספר מניות תקין');
      return;
    }
    const totalCost = Math.round(shares * price);

    if (tradeType === 'buy') {
      if (coins < totalCost) {
        Alert.alert('שגיאה', 'אין לך מספיק מטבעות');
        return;
      }

      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/user/portfolio/buy`, {
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
          const message = await readApiError(response, 'שגיאה בקניית המניות');
          throw new Error(message);
        }

        const data = await response.json();
        if (typeof data.newCoins === 'number') {
          setCoins(data.newCoins);
        }
        await refreshPortfolio();
        setShowTradeModal(false);
        setTradeShares('');
        Alert.alert('הצלחה', `קנית ${shares} מניות של ${selectedStock.symbol}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'שגיאה בקניית המניות';
        Alert.alert('שגיאה', message);
      }
    } else {
      const holding = getHolding(selectedStock.symbol);
      if (!holding || holding.shares < shares) {
        Alert.alert('שגיאה', 'אין לך מספיק מניות למכירה');
        return;
      }

      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/user/portfolio/sell`, {
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
          const message = await readApiError(response, 'שגיאה במכירת המניות');
          throw new Error(message);
        }

        const data = await response.json();
        if (typeof data.newCoins === 'number') {
          setCoins(data.newCoins);
        }
        await refreshPortfolio();
        setShowTradeModal(false);
        setTradeShares('');
        Alert.alert('הצלחה', `מכרת ${shares} מניות של ${selectedStock.symbol}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'שגיאה במכירת המניות';
        Alert.alert('שגיאה', message);
      }
    }
  };

  const chartBgColor = theme.colors.surface.darkBg;
  const candleUpColor = theme.colors.growthGreen;
  const candleDownColor = theme.colors.optimismOrange;
  const gridColor = 'rgba(63, 159, 255, 0.12)';
  const tvInterval = mapRangeToTv(selectedRange);

  const tvHtml = `
    <!DOCTYPE html>
    <html lang="he">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>html,body,#container{margin:0;padding:0;height:100%;width:100%;background:${chartBgColor};overflow:hidden;}</style>
      <script src="https://s3.tradingview.com/tv.js"></script>
    </head>
    <body>
      <div id="container"></div>
      <script>
        let chartApi;
        const widget = new TradingView.widget({
          autosize: true,
          symbol: '${selectedStock.symbol}',
          interval: '${tvInterval}',
          container_id: 'container',
          locale: 'he',
          theme: 'dark',
          timezone: 'Etc/UTC',
          hide_top_toolbar: true,
          hide_side_toolbar: true,
          hide_legend: true,
          allow_symbol_change: false,
          enable_publishing: false,
          studies: [],
          disabled_features: [
            'header_widget',
            'left_toolbar',
            'control_bar',
            'timeframes_toolbar',
            'symbol_search_hot_key',
            'header_symbol_search',
            'header_compare',
            'header_undo_redo',
            'header_screenshot',
            'header_chart_type',
            'header_settings',
            'header_indicators',
            'header_saveload',
            'display_market_status',
            'create_volume_indicator_by_default'
          ],
          overrides: {
            'paneProperties.background': '${chartBgColor}',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.vertGridProperties.color': '${gridColor}',
            'paneProperties.horzGridProperties.color': '${gridColor}',
            'scalesProperties.textColor': '#8CA0AE',
            'mainSeriesProperties.candleStyle.upColor': '${candleUpColor}',
            'mainSeriesProperties.candleStyle.downColor': '${candleDownColor}',
            'mainSeriesProperties.candleStyle.borderUpColor': '${candleUpColor}',
            'mainSeriesProperties.candleStyle.borderDownColor': '${candleDownColor}',
            'mainSeriesProperties.candleStyle.wickUpColor': '${candleUpColor}',
            'mainSeriesProperties.candleStyle.wickDownColor': '${candleDownColor}'
          },
        });
        async function publishQuote(sym) {
          try {
            const res = await fetch(
              'https://query1.finance.yahoo.com/v8/finance/chart/' +
                encodeURIComponent(sym) +
                '?interval=1d&range=1d'
            );
            const json = await res.json();
            const meta = json && json.chart && json.chart.result && json.chart.result[0] && json.chart.result[0].meta;
            if (!meta || !meta.regularMarketPrice) return;
            const price = meta.regularMarketPrice;
            const prev = meta.chartPreviousClose || meta.previousClose || price;
            const changePercent = prev ? ((price - prev) / prev) * 100 : 0;
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'quote',
              symbol: sym,
              price: price,
              changePercent: changePercent,
            }));
          } catch (e) {}
        }

        widget.onChartReady(() => {
          chartApi = widget.chart();
          const sym = '${selectedStock.symbol}';
          publishQuote(sym);
          setInterval(function () { publishQuote(sym); }, 15000);
          try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' })); } catch(e){}
        });
        document.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data || '{}');
            if (!chartApi) return;
            if (data.type === 'setSymbol' && data.symbol) {
              chartApi.setSymbol(data.symbol, data.interval || '${tvInterval}');
              publishQuote(data.symbol);
            } else if (data.type === 'setInterval' && data.interval) {
              chartApi.setResolution(String(data.interval));
            }
          } catch (e) {}
        });
        window.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data || '{}');
            if (!chartApi) return;
            if (data.type === 'setSymbol' && data.symbol) {
              chartApi.setSymbol(data.symbol, data.interval || '${tvInterval}');
              publishQuote(data.symbol);
            } else if (data.type === 'setInterval' && data.interval) {
              chartApi.setResolution(String(data.interval));
            }
          } catch (e) {}
        });
      </script>
    </body>
    </html>`;

  return (
    <View style={styles.container}>
      <TopBar />
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
          key={`${selectedStock.symbol}-${selectedRange}`}
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: tvHtml }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          style={styles.chart}
          allowsInlineMediaPlayback
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data || '{}');
              if (
                data.type === 'quote' &&
                data.symbol &&
                data.price &&
                String(data.symbol).toUpperCase() === selectedStock.symbol.toUpperCase()
              ) {
                setLivePrice(Number(data.price));
                if (data.changePercent != null) {
                  setLiveChangePercent(Number(data.changePercent));
                }
              }
            } catch {
              // ignore malformed messages
            }
          }}
        />
      </View>

      <TradingActionDock
        sellShares={maxSellShares}
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
              מחיר: {livePrice ? formatUsd(livePrice) : '—'}
            </Text>

            <View style={styles.modalBalanceRow}>
              <Text style={styles.modalBalanceLabel}>מזומן זמין</Text>
              <Text style={styles.modalBalanceValue}>{formatUsd(coins)}</Text>
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
                <Text style={styles.costValue}>{formatUsd(tradeTotal)}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowTradeModal(false);
                  setTradeShares('');
                }}
              >
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  tradeType === 'buy' ? styles.confirmBuy : styles.confirmSell,
                ]}
                onPress={handleTrade}
              >
                <Text style={styles.confirmButtonText}>
                  {tradeType === 'buy' ? 'אשר קנייה' : 'אשר מכירה'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chartArea: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: theme.colors.surface.darkBg,
  },
  chart: {
    flex: 1,
    backgroundColor: theme.colors.surface.darkBg,
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
});
