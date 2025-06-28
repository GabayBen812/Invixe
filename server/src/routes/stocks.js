const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Mock stock data generator
const generateStockData = (symbol, count = 50, interval = '1h') => {
  const data = [];
  const basePrice = 100 + Math.random() * 200;
  const now = Date.now();
  
  // Determine ms per point based on interval
  let msPerPoint = 60000; // default 1 minute
  switch (interval) {
    case '1m': msPerPoint = 60000; break;
    case '5m': msPerPoint = 5 * 60000; break;
    case '1h': msPerPoint = 60 * 60000; break;
    case '1d': msPerPoint = 24 * 60 * 60000; break;
    case '1w': msPerPoint = 7 * 24 * 60 * 60000; break;
    case '1mo': msPerPoint = 30 * 24 * 60 * 60000; break;
    default: msPerPoint = 60000;
  }
  
  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * msPerPoint;
    const price = basePrice + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 5;
    data.push({ timestamp, price: parseFloat(price.toFixed(2)) });
  }
  
  return data;
};

// Get stock data for a specific symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { count = 50, interval = '1h' } = req.query;
    const validSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
    if (!validSymbols.includes(symbol.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid stock symbol' });
    }

    // Map intervals to Alpha Vantage
    const intervalMap = {
      '1m': '1min',
      '5m': '5min',
      '1h': '60min',
      '1d': 'daily',
      '1w': 'weekly',
      '1mo': 'monthly',
    };
    const avInterval = intervalMap[interval] || '60min';

    let url;
    if (['1m', '5m', '1h'].includes(interval)) {
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${avInterval}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    } else if (interval === '1d') {
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    } else if (interval === '1w') {
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    } else if (interval === '1mo') {
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    }

    let data = [];
    let ohlc = [];
    try {
      const response = await axios.get(url);
      let timeSeries;
      if (response.data['Time Series (1min)']) timeSeries = response.data['Time Series (1min)'];
      if (response.data['Time Series (5min)']) timeSeries = response.data['Time Series (5min)'];
      if (response.data['Time Series (60min)']) timeSeries = response.data['Time Series (60min)'];
      if (response.data['Time Series (Daily)']) timeSeries = response.data['Time Series (Daily)'];
      if (response.data['Weekly Time Series']) timeSeries = response.data['Weekly Time Series'];
      if (response.data['Monthly Time Series']) timeSeries = response.data['Monthly Time Series'];

      if (timeSeries) {
        data = Object.entries(timeSeries).map(([timestamp, value]) => ({
          timestamp: new Date(timestamp).getTime(),
          price: parseFloat(value['4. close']),
        })).reverse().slice(-count);
        ohlc = Object.entries(timeSeries).map(([timestamp, value]) => ({
          timestamp: new Date(timestamp).getTime(),
          open: parseFloat(value['1. open']),
          high: parseFloat(value['2. high']),
          low: parseFloat(value['3. low']),
          close: parseFloat(value['4. close']),
        })).reverse().slice(-count);
      } else {
        // If API limit reached or error, fallback to mock
        data = generateStockData(symbol.toUpperCase(), parseInt(count), interval);
        ohlc = [];
      }
    } catch (err) {
      // Fallback to mock data on error
      data = generateStockData(symbol.toUpperCase(), parseInt(count), interval);
      ohlc = [];
    }

    res.json({
      symbol: symbol.toUpperCase(),
      data,
      ohlc,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get real-time price update (simulated)
router.get('/:symbol/price', (req, res) => {
  try {
    const { symbol } = req.params;
    
    const validSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
    if (!validSymbols.includes(symbol.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid stock symbol' });
    }
    
    const basePrice = 100 + Math.random() * 200;
    const currentPrice = basePrice + (Math.random() - 0.5) * 10;
    const change = (Math.random() - 0.5) * 5;
    const changePercent = (change / currentPrice) * 100;
    
    res.json({
      symbol: symbol.toUpperCase(),
      price: parseFloat(currentPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available stocks
router.get('/', (req, res) => {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
  ];
  
  res.json({ stocks });
});

module.exports = router; 