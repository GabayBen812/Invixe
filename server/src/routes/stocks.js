const express = require('express');
const router = express.Router();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const quoteCache = new Map();
const historyCache = new Map();

if (!FINNHUB_API_KEY) {
  console.warn(
    'FINNHUB_API_KEY is not set — stock quotes and history will be unavailable.',
  );
}

function rangeToDays(range) {
  switch (String(range || '1mo').toLowerCase()) {
    case '1d':
      return 1;
    case '5d':
      return 5;
    case '1w':
      return 7;
    case '1mo':
      return 30;
    case '3mo':
      return 90;
    case '6mo':
      return 180;
    case '1y':
      return 365;
    default:
      return 30;
  }
}

async function fetchFinnhubQuote(symbol) {
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key not configured');
  }

  const upper = String(symbol).toUpperCase();
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(upper)}&token=${encodeURIComponent(FINNHUB_API_KEY)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Finnhub quote failed (${response.status})`);
  }

  const json = await response.json();
  const price = Number(json?.c);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Finnhub quote missing price');
  }

  const change = Number(json?.d ?? 0);
  const changePercent = Number(json?.dp ?? 0);
  return { symbol: upper, price, change, changePercent };
}

async function fetchFinnhubDailyCloses(symbol, range = '1mo') {
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key not configured');
  }

  const upper = String(symbol).toUpperCase();
  const days = rangeToDays(range);
  const to = Math.floor(Date.now() / 1000);
  const from = to - days * 24 * 60 * 60;
  const url =
    `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(upper)}` +
    `&resolution=D&from=${from}&to=${to}&token=${encodeURIComponent(FINNHUB_API_KEY)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Finnhub candles failed (${response.status})`);
  }

  const json = await response.json();
  if (json?.s !== 'ok' || !Array.isArray(json?.t) || !Array.isArray(json?.c)) {
    throw new Error('Finnhub candles missing data');
  }

  const points = [];
  for (let i = 0; i < json.t.length; i++) {
    const close = Number(json.c[i]);
    if (!Number.isFinite(close) || close <= 0) continue;
    points.push({ timestamp: json.t[i], close });
  }
  return points;
}

async function getLiveQuote(symbol) {
  const upper = String(symbol).toUpperCase();
  const cached = quoteCache.get(upper);
  if (cached && Date.now() - cached.ts < 60_000) {
    return cached.data;
  }

  const data = await fetchFinnhubQuote(upper);
  quoteCache.set(upper, { data, ts: Date.now() });
  return data;
}

async function getDailyCloses(symbol, range = '1mo') {
  const upper = String(symbol).toUpperCase();
  const cacheKey = `${upper}:${range}`;
  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < 15 * 60_000) {
    return cached.data;
  }

  const points = await fetchFinnhubDailyCloses(upper, range);
  if (points.length) {
    historyCache.set(cacheKey, { data: points, ts: Date.now() });
  }
  return points;
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

    const settled = await Promise.allSettled(
      symbolList.map((symbol) => getLiveQuote(symbol)),
    );
    const prices = settled
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);

    if (!prices.length) {
      return res.status(503).json({ error: 'Live quotes unavailable' });
    }

    res.json({ prices });
  } catch (error) {
    console.warn('Batch quote error:', error.message);
    res.status(503).json({ error: 'Failed to fetch prices' });
  }
});

// GET daily closes for portfolio sparklines — must be before /:symbol
router.get('/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const range = String(req.query.range || '1mo');
    const points = await getDailyCloses(symbol, range);

    if (!points.length) {
      return res.status(404).json({ error: 'History not found' });
    }

    res.json({
      symbol: String(symbol).toUpperCase(),
      range,
      points,
    });
  } catch (error) {
    console.warn(`History error for ${req.params.symbol}:`, error.message);
    res.status(503).json({ error: 'Failed to fetch history' });
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
    console.warn(`Quote error for ${req.params.symbol}:`, error.message);
    res.status(503).json({ error: 'Failed to fetch price' });
  }
});

// GET stock data for a specific symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { count = 50, interval = '1h' } = req.query;

    const quote = await getLiveQuote(symbol);
    const basePrice = quote.price;
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
    console.warn(`Synthetic series error for ${req.params.symbol}:`, error.message);
    res.status(503).json({ error: 'Failed to fetch stock data' });
  }
});

module.exports = router;
