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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import TopBar from '../components/ui/TopBar';
import BottomNavbar from '../components/ui/BottomNavbar';
import PageBackground from '../components/ui/PageBackground';
import theme from '../theme';
import Svg, { Path, Line, Circle, G, Text as SvgText, Rect } from 'react-native-svg';

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
  const [displayMode, setDisplayMode] = useState<'line' | 'candles'>('line');
  const [ohlcData, setOhlcData] = useState<any[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveChange, setLiveChange] = useState<number | null>(null);
  const [liveChangePercent, setLiveChangePercent] = useState<number | null>(null);

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

  const fetchStockData = async (symbol: string, interval: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://10.0.0.52:4000/api/stocks/${symbol}?count=50&interval=${interval}`);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch live price
  const fetchLivePrice = async (symbol: string) => {
    try {
      const response = await fetch(`http://10.0.0.52:4000/api/stocks/${symbol}/price`);
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

  const handleStockSelect = (stock: typeof STOCKS[0]) => {
    setSelectedStock(stock);
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
        // TODO: Navigate to profile screen
        console.log('profile pressed');
        break;
      case 'shop':
        // TODO: Navigate to shop screen
        console.log('Shop pressed');
        break;
    }
  };

  const clearDrawing = () => {
    setDrawingPath([]);
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
        <G>
          {/* Grid lines and Y-axis price labels (reuse from line chart) */}
          {[...Array(5)].map((_, i) => (
            <>
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
            </>
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
    if (isLoading || stockData.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading {selectedStock.symbol} data...</Text>
        </View>
      );
    }

    const width = SCREEN_WIDTH;
    const height = SCREEN_HEIGHT - 200; // Account for title, bubbles, and navbar
    const padding = 40; // Increased for y-axis labels

    const minPrice = Math.min(...stockData.map(d => d.price));
    const maxPrice = Math.max(...stockData.map(d => d.price));
    const priceRange = maxPrice - minPrice || 1; // Prevent division by zero

    const minTime = Math.min(...stockData.map(d => d.timestamp));
    const maxTime = Math.max(...stockData.map(d => d.timestamp));
    const timeRange = maxTime - minTime || 1; // Prevent division by zero

    // Y-axis price labels (5 steps)
    const ySteps = 5;
    const priceLabels = Array.from({ length: ySteps }, (_, i) => {
      const price = maxPrice - (i * priceRange) / (ySteps - 1);
      return {
        price: price,
        y: padding + (i * height) / (ySteps - 1),
      };
    });

    // X-axis time labels (4 steps)
    const xSteps = 4;
    const timeLabels = Array.from({ length: xSteps }, (_, i) => {
      const timestamp = minTime + (i * timeRange) / (xSteps - 1);
      return {
        timestamp,
        x: padding + (i * (width - 2 * padding)) / (xSteps - 1),
      };
    });

    // Generate path for stock line with validation
    let pathData = '';
    stockData.forEach((data, index) => {
      const x = padding + (data.timestamp - minTime) / timeRange * (width - 2 * padding);
      const y = padding + height - ((data.price - minPrice) / priceRange * height);
      if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
        if (index === 0) {
          pathData += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
        } else {
          pathData += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        }
      }
    });

    // Generate drawing path with validation
    let drawingPathData = '';
    if (drawingPath.length > 0) {
      drawingPath.forEach((point, index) => {
        if (!isNaN(point.x) && !isNaN(point.y) && isFinite(point.x) && isFinite(point.y)) {
          if (index === 0) {
            drawingPathData += `M ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
          } else {
            drawingPathData += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
          }
        }
      });
    }

    return (
      <View 
        style={styles.graphContainer}
        {...panResponder.panHandlers}
      >
        {displayMode === 'candles' ? renderCandles() : (
          <Svg width={width} height={height + 2 * padding}>
            <G
              transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}
            >
              {/* Grid lines and Y-axis price labels */}
              {[...Array(ySteps)].map((_, i) => (
                <>
                  <Line
                    key={`grid-${i}`}
                    x1={padding}
                    y1={padding + (i * height) / (ySteps - 1)}
                    x2={padding + width - 2 * padding}
                    y2={padding + (i * height) / (ySteps - 1)}
                    stroke={theme.colors.gray}
                    strokeWidth={1}
                    opacity={0.3}
                  />
                  <SvgText
                    key={`price-label-${i}`}
                    x={8}
                    y={padding + (i * height) / (ySteps - 1) + 4}
                    fontSize={12}
                    fill={'#125BA5'}
                    fontFamily={theme.font.bold}
                    textAnchor="start"
                  >
                    {priceLabels[i].price.toFixed(2)}
                  </SvgText>
                </>
              ))}

              {/* X-axis time labels */}
              {timeLabels.map((label, i) => (
                <SvgText
                  key={`time-label-${i}`}
                  x={label.x}
                  y={padding + height + 18}
                  fontSize={12}
                  fill={'#125BA5'}
                  fontFamily={theme.font.bold}
                  textAnchor="middle"
                >
                  {formatTime(label.timestamp, selectedRange)}
                </SvgText>
              ))}

              {/* Stock price line */}
              {pathData && (
                <Path
                  d={pathData}
                  stroke={theme.colors.primaryBlue}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* Data points */}
              {stockData.map((data, index) => {
                const x = padding + (data.timestamp - minTime) / timeRange * (width - 2 * padding);
                const y = padding + height - ((data.price - minPrice) / priceRange * height);
                if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
                  return (
                    <Circle
                      key={index}
                      cx={x}
                      cy={y}
                      r={2}
                      fill={theme.colors.primaryBlue}
                    />
                  );
                }
                return null;
              })}
              {/* Drawing path */}
              {drawingPathData && (
                <Path
                  d={drawingPathData}
                  stroke={theme.colors.optimismOrange}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </G>
          </Svg>
        )}
        
        {/* Graph controls */}
        <View style={styles.graphControls}>
          <TouchableOpacity
            style={[styles.controlButton, drawingMode && styles.activeControlButton]}
            onPress={() => setDrawingMode(!drawingMode)}
          >
            <Text style={styles.controlButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setScale(scale * 1.2)}
          >
            <Text style={styles.controlButtonText}>🔍+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setScale(Math.max(0.5, scale * 0.8))}
          >
            <Text style={styles.controlButtonText}>🔍-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={clearDrawing}
          >
            <Text style={styles.controlButtonText}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setDisplayMode(displayMode === 'line' ? 'candles' : 'line')}
          >
            <Text style={styles.controlButtonText}>
              {displayMode === 'line' ? '📊' : '📈'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Price info */}
        <View style={styles.priceInfo}>
          <Text style={styles.priceText}>
            {livePrice !== null ? `$${livePrice.toFixed(2)}` : '...'}
          </Text>
          <Text style={styles.priceChange}>
            {liveChange !== null && liveChangePercent !== null
              ? `${liveChange > 0 ? '+' : ''}${liveChangePercent.toFixed(2)}% (${liveChange > 0 ? '+' : ''}$${liveChange.toFixed(2)})`
              : ''}
          </Text>
        </View>

        {/* Mode indicator */}
        {drawingMode && (
          <View style={styles.modeIndicator}>
            <Text style={styles.modeText}>Drawing Mode</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <PageBackground source={require("../assets/bg.png")}>
        <TopBar />
        <View style={styles.content}>
          {/* <Text style={styles.title}>Sandbox - {selectedStock.symbol}</Text> */}
          {renderStockBubbles()}
          {renderTimeRangeSelector()}
          <View style={styles.hr} />
          {renderGraph()}
        </View>
      </PageBackground>
      <BottomNavbar activeTab="graph" onTabPress={handleTabPress} />
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
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: '#A0CFFF',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    shadowColor: '#0D2033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: '#0D2033',
  },
  priceChange: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.growthGreen,
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
}); 