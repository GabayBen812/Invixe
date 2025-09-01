import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import TopBar from '../components/ui/TopBar';
import BottomNavbar from '../components/ui/BottomNavbar';
import PageBackground from '../components/ui/PageBackground';
import theme from '../theme';
import { useUser } from '../context/UserContext';
import Svg, { Path, Line, Circle, G, Text as SvgText, Rect } from 'react-native-svg';
import { WebView } from 'react-native-webview';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

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

const TIME_RANGES = ['1m', '5m', '1h', '1d', '1w', '1mo'];

type Props = NativeStackScreenProps<RootStackParamList, 'Sandbox'>;

interface StockData {
  timestamp: number;
  price: number;
}

interface DrawingPoint {
  x: number;
  y: number;
}

export default function SandboxScreen({ navigation }: Props) {
  const { coins, setCoins } = useUser();
  const [selectedStock, setSelectedStock] = useState(STOCKS[0]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawingMode, setDrawingMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drawingPath, setDrawingPath] = useState<DrawingPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastOffset = useRef({ x: 0, y: 0 });
  const [selectedRange, setSelectedRange] = useState('1h');
  const [displayMode, setDisplayMode] = useState<'line' | 'candles'>('candles');
  const webViewRef = useRef<any>(null);
  const [ohlcData, setOhlcData] = useState<any[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveChange, setLiveChange] = useState<number | null>(null);
  const [liveChangePercent, setLiveChangePercent] = useState<number | null>(null);
  
  // Trading state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeShares, setTradeShares] = useState('');
  const [userHoldings, setUserHoldings] = useState<any[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => drawingMode ? true : true,
      onMoveShouldSetPanResponder: (evt, gestureState) => drawingMode ? true : true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        if (drawingMode) {
          setIsDrawing(true);
          const { locationX, locationY } = evt.nativeEvent;
          setDrawingPath([{ x: locationX, y: locationY }]);
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (drawingMode && isDrawing) {
          const { locationX, locationY } = evt.nativeEvent;
          setDrawingPath(prev => [...prev, { x: locationX, y: locationY }]);
        } else if (!drawingMode) {
          setOffset({
            x: lastOffset.current.x + gestureState.dx,
            y: lastOffset.current.y + gestureState.dy,
          });
        }
      },
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (!drawingMode) {
          lastOffset.current = {
            x: lastOffset.current.x + gestureState.dx,
            y: lastOffset.current.y + gestureState.dy,
          };
        }
        setIsDrawing(false);
      },
    })
  ).current;

  // Fetch stock data
  useEffect(() => {
    fetchStockData(selectedStock.symbol, selectedRange);
  }, [selectedStock, selectedRange]);

  // Send updates to TradingView WebView when symbol/range changes
  useEffect(() => {
    const interval = mapRangeToTv(selectedRange);
    try {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'setSymbol', symbol: selectedStock.symbol, interval }));
    } catch {}
  }, [selectedStock]);

  useEffect(() => {
    const interval = mapRangeToTv(selectedRange);
    try {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'setInterval', interval }));
    } catch {}
  }, [selectedRange]);

  const fetchStockData = async (symbol: string, interval: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://10.0.0.16:4000/api/stocks/${symbol}?count=50&interval=${interval}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      const result = await response.json();
      const validData = result.data.filter((item: any) => 
        typeof item.price === 'number' && 
        !isNaN(item.price) && 
        isFinite(item.price) &&
        typeof item.timestamp === 'number' && 
        !isNaN(item.timestamp) && 
        isFinite(item.timestamp)
      );
      setStockData(validData);
      // Parse OHLC if available
      if (result.ohlc) {
        setOhlcData(result.ohlc);
      } else {
        setOhlcData([]);
      }
      // Reset view to default position
      setOffset({ x: 0, y: 0 });
      setScale(1);
      lastOffset.current = { x: 0, y: 0 };
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Fallback to mock data if API fails
      const mockData: StockData[] = [];
      const basePrice = 100 + Math.random() * 200;
      const now = Date.now();
      
      for (let i = 0; i < 50; i++) {
        const timestamp = now - (50 - i) * 60000; // 1 minute intervals
        const price = basePrice + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 5;
        mockData.push({ timestamp, price });
      }
      
      setStockData(mockData);
      setOhlcData([]);
      // Reset view to default position for mock data too
      setOffset({ x: 0, y: 0 });
      setScale(1);
      lastOffset.current = { x: 0, y: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch live price
  const fetchLivePrice = async (symbol: string) => {
    try {
      const response = await fetch(`http://10.0.0.16:4000/api/stocks/${symbol}/price`);
      if (!response.ok) return;
      const result = await response.json();
      setLivePrice(result.price);
      setLiveChange(result.change);
      setLiveChangePercent(result.changePercent);
    } catch (e) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchLivePrice(selectedStock.symbol);
    const interval = setInterval(() => {
      fetchLivePrice(selectedStock.symbol);
    }, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, [selectedStock]);

  // Fetch user holdings
  useEffect(() => {
    fetchUserHoldings();
  }, []);

  const fetchUserHoldings = async () => {
    try {
      const response = await fetch('http://10.0.0.16:4000/api/user/portfolio');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      const data = await response.json();
      setUserHoldings(data.portfolio || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const handleStockSelect = (stock: typeof STOCKS[0]) => {
    setSelectedStock(stock);
  };

  const mapRangeToTv = (range: string) => {
    switch (range) {
      case '1m': return '1';
      case '5m': return '5';
      case '1h': return '60';
      case '1d': return 'D';
      case '1w': return 'W';
      case '1mo': return 'M';
      default: return '60';
    }
  };

  const mapTvToRange = (resolution: string) => {
    const r = String(resolution).toUpperCase();
    if (r === '1') return '1m';
    if (r === '5') return '5m';
    if (r === '60' || r === '1H') return '1h';
    if (r === 'D' || r === '1D') return '1d';
    if (r === 'W' || r === '1W') return '1w';
    if (r === 'M' || r === '1M') return '1mo';
    return '1h';
  };

  const handleTabPress = (tab: 'map' | 'profile' | 'shop' | 'graph') => {
    switch (tab) {
      case 'map':
        navigation.navigate('Map');
        break;
      case 'graph':
        // Already on graph screen, do nothing
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'shop':
        navigation.navigate('Shop');
        break;
    }
  };

  const clearDrawing = () => {
    setDrawingPath([]);
  };

  const getUserHolding = (symbol: string) => {
    return userHoldings.find(h => h.symbol === symbol);
  };

  const handleTrade = async () => {
    const shares = parseFloat(tradeShares);
    if (!livePrice || !tradeShares || isNaN(shares) || shares <= 0) {
      Alert.alert('שגיאה', 'אנא הכנס מספר מניות תקין');
      return;
    }
    const totalCost = shares * livePrice;

    if (tradeType === 'buy') {
      if (coins < totalCost) {
        Alert.alert('שגיאה', 'אין לך מספיק מטבעות');
        return;
      }

      try {
        const response = await fetch('http://10.0.0.16:4000/api/user/portfolio/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: selectedStock.symbol,
            shares: shares,
            price: livePrice
          })
        });

        if (!response.ok) {
          throw new Error('Failed to buy stock');
        }

        const data = await response.json();
        setCoins(data.newCoins);
        fetchUserHoldings();
        setShowTradeModal(false);
        setTradeShares('');
        Alert.alert('הצלחה', `קנית ${shares} מניות של ${selectedStock.symbol}`);
      } catch (error) {
        Alert.alert('שגיאה', 'שגיאה בקניית המניות');
      }
    } else {
      const holding = getUserHolding(selectedStock.symbol);
      if (!holding || holding.shares < shares) {
        Alert.alert('שגיאה', 'אין לך מספיק מניות למכירה');
        return;
      }

      try {
        const response = await fetch('http://10.0.0.16:4000/api/user/portfolio/sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: selectedStock.symbol,
            shares: shares,
            price: livePrice
          })
        });

        if (!response.ok) {
          throw new Error('Failed to sell stock');
        }

        const data = await response.json();
        setCoins(data.newCoins);
        fetchUserHoldings();
        setShowTradeModal(false);
        setTradeShares('');
        Alert.alert('הצלחה', `מכרת ${shares} מניות של ${selectedStock.symbol}`);
      } catch (error) {
        Alert.alert('שגיאה', 'שגיאה במכירת המניות');
      }
    }
  };

  const renderStockBubbles = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.stockBubblesContainer}
      contentContainerStyle={styles.stockBubblesContent}
    >
      {STOCKS.map((stock) => {
        const selected = selectedStock.symbol === stock.symbol;
        return (
          <TouchableOpacity
            key={stock.symbol}
            onPress={() => setSelectedStock(stock)}
            activeOpacity={0.8}
            style={[
              styles.stockBubble,
              selected && styles.selectedStockBubble
            ]}
          >
            <Text style={[
              styles.stockSymbol,
              selected && styles.selectedStockText
            ]}>
              {stock.symbol}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {TIME_RANGES.map((range) => (
        <TouchableOpacity
          key={range}
          onPress={() => setSelectedRange(range)}
          style={[
            styles.timeRangeBubble,
            selectedRange === range && styles.selectedTimeRangeBubble
          ]}
        >
          <Text style={[
            styles.timeRangeText,
            selectedRange === range && styles.selectedTimeRangeText
          ]}>
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCandles = () => {
    if (!ohlcData.length) return null;
    const width = SCREEN_WIDTH;
    const height = SCREEN_HEIGHT - 200;
    const padding = 40;
    const minPrice = Math.min(...ohlcData.map(d => d.low));
    const maxPrice = Math.max(...ohlcData.map(d => d.high));
    const priceRange = maxPrice - minPrice || 1;
    const minTime = Math.min(...ohlcData.map(d => d.timestamp));
    const maxTime = Math.max(...ohlcData.map(d => d.timestamp));
    const timeRange = maxTime - minTime || 1;
    const candleWidth = Math.max(4, (width - 2 * padding) / ohlcData.length - 2);

    return (
      <Svg width={width} height={height + 2 * padding}>
        <G
          transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}
        >
          {/* Grid lines and Y-axis price labels (reuse from line chart) */}
          {[...Array(5)].map((_, i) => (
            <React.Fragment key={`grid-label-${i}`}>
              <Line
                key={`grid-${i}`}
                x1={padding}
                y1={padding + (i * height) / 4}
                x2={padding + width - 2 * padding}
                y2={padding + (i * height) / 4}
                stroke={theme.colors.gray}
                strokeWidth={1}
                opacity={0.3}
              />
              <SvgText
                key={`price-label-${i}`}
                x={8}
                y={padding + (i * height) / 4 + 4}
                fontSize={12}
                fill={'#125BA5'}
                fontFamily={theme.font.bold}
                textAnchor="start"
              >
                {(maxPrice - (i * priceRange) / 4).toFixed(2)}
              </SvgText>
            </React.Fragment>
          ))}
          {/* X-axis time labels */}
          {[0, 1, 2, 3].map((i) => {
            const idx = Math.floor(i * (ohlcData.length - 1) / 3);
            const d = ohlcData[idx];
            const x = padding + (d.timestamp - minTime) / timeRange * (width - 2 * padding);
            return (
              <SvgText
                key={`time-label-${i}`}
                x={x}
                y={padding + height + 18}
                fontSize={12}
                fill={'#125BA5'}
                fontFamily={theme.font.bold}
                textAnchor="middle"
              >
                {formatTime(d.timestamp, selectedRange)}
              </SvgText>
            );
          })}
          {/* Candles */}
          {ohlcData.map((d, i) => {
            const x = padding + (d.timestamp - minTime) / timeRange * (width - 2 * padding);
            const yOpen = padding + height - ((d.open - minPrice) / priceRange * height);
            const yClose = padding + height - ((d.close - minPrice) / priceRange * height);
            const yHigh = padding + height - ((d.high - minPrice) / priceRange * height);
            const yLow = padding + height - ((d.low - minPrice) / priceRange * height);
            const isUp = d.close >= d.open;
            return (
              <G key={i}>
                {/* Wick */}
                <Line
                  x1={x}
                  x2={x}
                  y1={yHigh}
                  y2={yLow}
                  stroke={isUp ? theme.colors.growthGreen : theme.colors.optimismOrange}
                  strokeWidth={2}
                />
                {/* Body */}
                <Rect
                  x={x - candleWidth / 2}
                  y={Math.min(yOpen, yClose)}
                  width={candleWidth}
                  height={Math.abs(yClose - yOpen) || 2}
                  fill={isUp ? theme.colors.growthGreen : theme.colors.optimismOrange}
                  rx={2}
                />
              </G>
            );
          })}
        </G>
      </Svg>
    );
  };

  const formatTime = (timestamp: number, selectedRange?: string) => {
    const d = new Date(timestamp);
    if (!selectedRange) return d.toLocaleDateString();
    if (selectedRange === '1m' || selectedRange === '5m' || selectedRange === '1h') {
      return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    } else {
      return d.toLocaleDateString();
    }
  };

  const renderGraph = () => {
    const tvHtml = `
      <!DOCTYPE html>
      <html lang="he">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <style> html,body,#container{margin:0;padding:0;height:100%;width:100%;background:#ffffff;} </style>
        <script src="https://s3.tradingview.com/tv.js"></script>
      </head>
      <body>
        <div id="container"></div>
        <script>
          let chartApi;
          const widget = new TradingView.widget({
            autosize: true,
            symbol: '${selectedStock.symbol}',
            interval: '${mapRangeToTv(selectedRange)}',
            container_id: 'container',
            datafeed: undefined,
            locale: 'he',
            theme: 'light',
            timezone: 'Etc/UTC',
            hide_side_toolbar: false,
            allow_symbol_change: true,
            enable_publishing: false,
            studies: [],
          });
          widget.onChartReady(() => {
            chartApi = widget.chart();
            // Notify RN about initial state
            try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' })); } catch(e){}
            // Symbol change listener
            chartApi.onSymbolChanged((symbolInfo) => {
              try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'symbolChanged', symbol: (symbolInfo && (symbolInfo.ticker || symbolInfo.name)) || '' })); } catch(e){}
            });
            // Interval / resolution change listener
            if (chartApi.onIntervalChanged) {
              chartApi.onIntervalChanged((interval, timeframeObj) => {
                try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'intervalChanged', interval: interval })); } catch(e){}
              });
            } else if (chartApi.onResolutionChanged) {
              chartApi.onResolutionChanged((resolution) => {
                try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'intervalChanged', interval: resolution })); } catch(e){}
              });
            }
          });
          // Receive messages from React Native
          window.addEventListener('message', (event) => {
            try {
              const data = JSON.parse(event.data || '{}');
              if (!chartApi) return;
              if (data.type === 'setSymbol' && data.symbol) {
                chartApi.setSymbol(data.symbol, data.interval || '${mapRangeToTv(selectedRange)}');
              } else if (data.type === 'setInterval' && data.interval) {
                chartApi.setResolution(String(data.interval));
              }
            } catch (e) {}
          });
        </script>
      </body>
      </html>`;

    return (
      <View style={styles.graphContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: tvHtml }}
          javaScriptEnabled
          domStorageEnabled
          style={{ flex: 1, backgroundColor: '#fff' }}
          allowsInlineMediaPlayback
          onMessage={(e) => {
            try {
              const data = JSON.parse(e.nativeEvent.data || '{}');
              if (data.type === 'symbolChanged' && data.symbol) {
                setSelectedStock({ symbol: data.symbol, name: data.symbol });
              } else if (data.type === 'intervalChanged' && data.interval) {
                setSelectedRange(mapTvToRange(String(data.interval)));
              }
            } catch {}
          }}
        />
        {/* Trading buttons */}
        <View style={styles.tradingButtons}>
          <TouchableOpacity
            style={[styles.tradeButton, styles.buyButton]}
            onPress={() => {
              setTradeType('buy');
              setShowTradeModal(true);
            }}
          >
            <Text style={styles.tradeButtonText}>קנה</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tradeButton, styles.sellButton]}
            onPress={() => {
              setTradeType('sell');
              setShowTradeModal(true);
            }}
          >
            <Text style={styles.tradeButtonText}>מכור</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <PageBackground source={require("../assets/bg.png")}>
        <TopBar />
        <View style={styles.content}>
          {/* <Text style={styles.title}>Sandbox - {selectedStock.symbol}</Text> */}
          {/* Remove app-level stock/time selectors to avoid duplication with TradingView */}
          {/* {renderStockBubbles()} */}
          {/* {renderTimeRangeSelector()} */}
          {/* <View style={styles.hr} /> */}
          {renderGraph()}
        </View>
      </PageBackground>
      <BottomNavbar activeTab="graph" onTabPress={handleTabPress} />

      {/* Trading Modal */}
      <Modal
        visible={showTradeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {tradeType === 'buy' ? 'קנה מניות' : 'מכור מניות'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedStock.symbol} - ${livePrice?.toFixed(2) || '0.00'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>מספר מניות:</Text>
              <TextInput
                style={styles.textInput}
                value={tradeShares}
                onChangeText={setTradeShares}
                keyboardType="numeric"
                placeholder="הכנס מספר מניות"
                placeholderTextColor="#999"
              />
            </View>

            {/* Defensive: Only render cost info if value is a valid number, else render nothing */}
            {tradeType === 'buy' && livePrice && tradeShares && !isNaN(parseFloat(tradeShares)) && (
              <View style={styles.costInfo}>
                <Text style={styles.costLabel}>עלות כוללת:</Text>
                <Text style={styles.costValue}>
                  {isNaN(parseFloat(tradeShares) * (livePrice || 0))
                    ? ''
                    : `$${(parseFloat(tradeShares) * (livePrice || 0)).toFixed(2)}`}
                </Text>
              </View>
            )}

            {tradeType === 'sell' && livePrice && tradeShares && !isNaN(parseFloat(tradeShares)) && (
              <View style={styles.costInfo}>
                <Text style={styles.costLabel}>ערך כולל:</Text>
                <Text style={styles.costValue}>
                  {isNaN(parseFloat(tradeShares) * (livePrice || 0))
                    ? ''
                    : `$${(parseFloat(tradeShares) * (livePrice || 0)).toFixed(2)}`}
                </Text>
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
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleTrade}
              >
                <Text style={styles.confirmButtonText}>
                  {tradeType === 'buy' ? 'קנה' : 'מכור'}
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
    backgroundColor: '#D3E9FF', // palette background
  },
  content: {
    flex: 1,
    backgroundColor: '#D3E9FF', // palette background
  },
  title: {
    fontSize: 24,
    fontFamily: theme.font.bold,
    color: '#125BA5', // palette
    textAlign: 'center',
    marginVertical: theme.spacing.md,
    textShadowColor: '#0D2033',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  stockBubblesContainer: {
    backgroundColor: 'transparent',
    minHeight: 44,
    maxHeight: 48,
    height: 44,
    paddingHorizontal: 0,
    marginBottom: 8,
    marginTop: 4,
  },
  stockBubblesContent: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
    maxHeight: 48,
    height: 44,
    paddingHorizontal: 0,
    marginBottom: 0,
    marginTop: 0,
    backgroundColor: 'transparent',
  },
  stockBubble: {
    backgroundColor: '#A0CFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 4,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#0D2033',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedStockBubble: {
    backgroundColor: '#3F9FFF',
    borderColor: '#125BA5',
    borderWidth: 2,
    shadowColor: '#0D2033',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  stockSymbol: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: '#0D2033',
  },
  selectedStockText: {
    color: '#fff',
  },
  graphContainer: {
    flex: 1,
    backgroundColor: '#fff', // white for graph area
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: theme.font.family,
    color: '#125BA5',
  },
  graphControls: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
  },
  controlButton: {
    backgroundColor: '#D3E9FF',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activeControlButton: {
    backgroundColor: '#3F9FFF',
  },
  controlButtonText: {
    fontSize: 16,
    color: '#0D2033',
  },
  priceInfo: {
    backgroundColor: '#A0CFFF',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,

  },
  modeIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: '#125BA5',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  modeText: {
    fontSize: 12,
    fontFamily: theme.font.bold,
    color: '#fff',
  },
  hr: {
    height: 1,
    backgroundColor: '#A0CFFF',
    width: '100%',
    marginVertical: 6,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
    minHeight: 32,
    height: 32,
  },
  timeRangeBubble: {
    backgroundColor: '#D3E9FF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 2,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTimeRangeBubble: {
    backgroundColor: '#125BA5',
    borderColor: '#3F9FFF',
  },
  timeRangeText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: '#125BA5',
  },
  selectedTimeRangeText: {
    color: '#fff',
  },
  tradingButtons: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.md,
    flexDirection: 'row',
  },
  tradeButton: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buyButton: {
    backgroundColor: theme.colors.growthGreen,
  },
  sellButton: {
    backgroundColor: theme.colors.optimismOrange,
  },
  tradeButtonText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: '#fff',
  },
  holdingInfo: {
    backgroundColor: '#A0CFFF',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  holdingText: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: '#125BA5',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    width: '80%',
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: '#0D2033',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: theme.font.family,
    color: '#125BA5',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: '#0D2033',
    marginBottom: theme.spacing.xs,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#A0CFFF',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: 16,
    fontFamily: theme.font.family,
    color: '#0D2033',
    textAlign: 'center',
  },
  costInfo: {
    backgroundColor: '#A0CFFF',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: '#125BA5',
    marginBottom: theme.spacing.xs,
  },
  costValue: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: '#0D2033',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#D3E9FF',
  },
  confirmButton: {
    backgroundColor: theme.colors.primaryBlue,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: '#125BA5',
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: '#fff',
  },
  priceInfoContainer: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    alignItems: 'flex-start',
    zIndex: 10,
  },
  priceInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 120,
  },
  priceSymbol: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: '#125BA5',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: '#0D2033',
  },
  priceChange: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    marginTop: 2,
  },
}); 