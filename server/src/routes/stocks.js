const express = require('express');
const router = express.Router();

// Mock stock data for demo
const mockStockData = {
  AAPL: { price: 150.25, change: 2.15, changePercent: 1.45 },
  GOOGL: { price: 2750.80, change: -15.20, changePercent: -0.55 },
  MSFT: { price: 310.45, change: 5.30, changePercent: 1.74 },
  AMZN: { price: 3200.15, change: 25.80, changePercent: 0.81 },
  TSLA: { price: 850.90, change: -12.50, changePercent: -1.45 },
  META: { price: 320.75, change: 8.25, changePercent: 2.64 },
  NVDA: { price: 450.60, change: 15.40, changePercent: 3.54 },
  NFLX: { price: 580.30, change: -8.75, changePercent: -1.49 },
};

// GET stock data for a specific symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { count = 50, interval = '1h' } = req.query;
    
    // Mock data generation
    const data = [];
    const basePrice = mockStockData[symbol]?.price || 100 + Math.random() * 200;
    const now = Date.now();
    
    for (let i = 0; i < parseInt(count); i++) {
      const timestamp = now - (parseInt(count) - i) * 60000; // 1 minute intervals
      const price = basePrice + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 5;
      data.push({ timestamp, price });
    }
    
    // Generate OHLC data for candlestick charts
    const ohlc = [];
    for (let i = 0; i < data.length; i += 5) {
      const chunk = data.slice(i, i + 5);
      if (chunk.length > 0) {
        const prices = chunk.map(d => d.price);
        ohlc.push({
          timestamp: chunk[0].timestamp,
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1]
        });
      }
    }
    
    res.json({
      symbol,
      data,
      ohlc,
      interval
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// GET live price for a specific symbol
router.get('/:symbol/price', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = mockStockData[symbol];
    
    if (!stockData) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json({
      symbol,
      price: stockData.price,
      change: stockData.change,
      changePercent: stockData.changePercent
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// GET multiple stock prices
router.get('/prices', async (req, res) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols) {
      return res.status(400).json({ error: 'Symbols parameter required' });
    }
    
    const symbolList = symbols.split(',');
    const prices = symbolList.map(symbol => {
      const stockData = mockStockData[symbol];
      if (stockData) {
        return {
          symbol,
          price: stockData.price,
          change: stockData.change,
          changePercent: stockData.changePercent
        };
      }
      return null;
    }).filter(Boolean);
    
    res.json({ prices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

module.exports = router; 