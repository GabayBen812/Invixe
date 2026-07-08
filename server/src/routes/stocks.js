const express = require('express');
const router = express.Router();

const YAHOO_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const quoteCache = new Map();

const mockStockData = {
  // Last-resort only when Yahoo is unreachable. Keep near recent market levels.
  AAPL: { price: 214.0, change: 0, changePercent: 0 },
  GOOGL: { price: 363.0, change: 0, changePercent: 0 },
  MSFT: { price: 460.0, change: 0, changePercent: 0 },
  AMZN: { price: 225.0, change: 0, changePercent: 0 },
  TSLA: { price: 320.0, change: 0, changePercent: 0 },
  META: { price: 720.0, change: 0, changePercent: 0 },
  NVDA: { price: 145.0, change: 0, changePercent: 0 },
  NFLX: { price: 980.0, change: 0, changePercent: 0 },
};

async function fetchYahooQuote(symbol) {
  const upper = String(symbol).toUpperCase();
  const cached = quoteCache.get(upper);
  if (cached && Date.now() - cached.ts < 60_000) {
    return cached.data;
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(upper)}?interval=1d&range=1d`;
  const response = await fetch(url, {
    headers: { 'User-Agent': YAHOO_UA },
  });

  if (!response.ok) {
    throw new Error(`Yahoo quote failed (${response.status})`);
  }

  const json = await response.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) {
    throw new Error('Yahoo quote missing price');
  }

  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change = price - prev;
  const changePercent = prev ? (change / prev) * 100 : 0;
  const data = {
    symbol: upper,
    price,
    change,
    changePercent,
  };

  quoteCache.set(upper, { data, ts: Date.now() });
  return data;
}

async function getLiveQuote(symbol) {
  const upper = String(symbol).toUpperCase();
  try {
    return await fetchYahooQuote(upper);
  } catch (error) {
    console.warn(`Live quote fallback for ${upper}:`, error.message);
    const mock = mockStockData[upper];
    if (!mock) return null;
    return { symbol: upper, ...mock };
  }
}

// GET multiple stock prices — must be before /:symbol
router.get('/prices', async (req, res) => {
  try {
    const { symbols } = req.query;

    if (!symbols) {
      return res.status(400).json({ error: 'Symbols parameter required' });
    }

    const symbolList = String(symbols)
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const prices = (
      await Promise.all(symbolList.map((symbol) => getLiveQuote(symbol)))
    ).filter(Boolean);

    res.json({ prices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// GET live price for a specific symbol
router.get('/:symbol/price', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await getLiveQuote(symbol);

    if (!quote) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// GET stock data for a specific symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { count = 50, interval = '1h' } = req.query;

    const quote = await getLiveQuote(symbol);
    const basePrice = quote?.price ?? 100 + Math.random() * 200;
    const data = [];
    const now = Date.now();

    for (let i = 0; i < parseInt(count, 10); i++) {
      const timestamp = now - (parseInt(count, 10) - i) * 60000;
      const price =
        basePrice + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 5;
      data.push({ timestamp, price });
    }

    const ohlc = [];
    for (let i = 0; i < data.length; i += 5) {
      const chunk = data.slice(i, i + 5);
      if (chunk.length > 0) {
        const prices = chunk.map((d) => d.price);
        ohlc.push({
          timestamp: chunk[0].timestamp,
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1],
        });
      }
    }

    res.json({
      symbol,
      data,
      ohlc,
      interval,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

module.exports = router;
