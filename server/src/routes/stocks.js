const express = require('express');
const router = express.Router();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const TIINGO_API_TOKEN = process.env.TIINGO_API_TOKEN;

const quoteCache = new Map();
const historyCache = new Map();
const CHART_UA =
  'Mozilla/5.0 (compatible; InvixeServer/1.0; +https://invixe.app)';

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

async function fetchFinnhubDailyCloses(symbol, range = '1mo', fromOverride = null) {
  if (!FINNHUB_API_KEY) {
    throw new Error('Finnhub API key not configured');
  }

  const upper = String(symbol).toUpperCase();
  const days = rangeToDays(range);
  const to = Math.floor(Date.now() / 1000);
  const from =
    fromOverride != null && Number.isFinite(Number(fromOverride))
      ? Math.floor(Number(fromOverride))
      : to - days * 24 * 60 * 60;
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

function rangeToYahooParam(range) {
  switch (String(range || '1mo').toLowerCase()) {
    case '1d':
      return '1d';
    case '5d':
      return '5d';
    case '1w':
      return '5d';
    case '1mo':
      return '1mo';
    case '3mo':
      return '3mo';
    case '6mo':
      return '6mo';
    case '1y':
      return '1y';
    default:
      return '1mo';
  }
}

function parseYahooChartPoints(json) {
  const result = json?.chart?.result?.[0];
  const timestamps = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;
  if (!Array.isArray(timestamps) || !Array.isArray(closes)) return [];

  const points = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = Number(closes[i]);
    const timestamp = Number(timestamps[i]);
    if (!Number.isFinite(close) || close <= 0) continue;
    if (!Number.isFinite(timestamp) || timestamp <= 0) continue;
    points.push({ timestamp, close });
  }
  return points;
}

/** Finnhub free tier does not include US daily candles — use EOD fallback. */
async function fetchEodDailyCloses(symbol, range = '1mo', fromOverride = null) {
  const upper = String(symbol).toUpperCase();
  const to = Math.floor(Date.now() / 1000);
  const from =
    fromOverride != null && Number.isFinite(Number(fromOverride))
      ? Math.floor(Number(fromOverride))
      : to - rangeToDays(range) * 24 * 60 * 60;

  let url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(upper)}` +
    `?interval=1d&period1=${from}&period2=${to}`;
  let response = await fetch(url, { headers: { 'User-Agent': CHART_UA } });
  if (!response.ok) {
    throw new Error(`EOD history failed (${response.status})`);
  }

  let points = parseYahooChartPoints(await response.json());
  if (points.length >= 2) return points;

  url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(upper)}` +
    `?interval=1d&range=${rangeToYahooParam(range)}`;
  response = await fetch(url, { headers: { 'User-Agent': CHART_UA } });
  if (!response.ok) {
    throw new Error(`EOD history failed (${response.status})`);
  }

  points = parseYahooChartPoints(await response.json());
  if (points.length < 2) {
    throw new Error('EOD history missing data');
  }
  return points;
}

async function fetchTiingoDailyCloses(symbol, range = '1mo', fromOverride = null) {
  if (!TIINGO_API_TOKEN) {
    throw new Error('Tiingo API token not configured');
  }

  const upper = String(symbol).toUpperCase();
  const to = new Date();
  const from =
    fromOverride != null && Number.isFinite(Number(fromOverride))
      ? new Date(Number(fromOverride) * 1000)
      : new Date(to.getTime() - rangeToDays(range) * 24 * 60 * 60 * 1000);
  const startDate = from.toISOString().slice(0, 10);
  const endDate = to.toISOString().slice(0, 10);
  const url =
    `https://api.tiingo.com/tiingo/daily/${encodeURIComponent(upper)}/prices` +
    `?startDate=${startDate}&endDate=${endDate}&token=${encodeURIComponent(TIINGO_API_TOKEN)}`;
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) {
    throw new Error(`Tiingo EOD failed (${response.status})`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    throw new Error('Tiingo EOD missing data');
  }

  const points = [];
  for (const row of rows) {
    const close = Number(row?.adjClose ?? row?.close);
    const date = String(row?.date || '');
    const timestamp = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000);
    if (!Number.isFinite(close) || close <= 0) continue;
    if (!Number.isFinite(timestamp) || timestamp <= 0) continue;
    points.push({ timestamp, close });
  }
  return points;
}

async function fetchDailyClosesForSymbol(symbol, range = '1mo', fromOverride = null) {
  const upper = String(symbol).toUpperCase();
  const errors = [];

  if (FINNHUB_API_KEY) {
    try {
      const points = await fetchFinnhubDailyCloses(upper, range, fromOverride);
      if (points.length >= 2) return { points, source: 'finnhub' };
      errors.push('Finnhub returned insufficient data');
    } catch (error) {
      errors.push(`Finnhub: ${error.message}`);
    }
  } else {
    errors.push('Finnhub API key not configured');
  }

  if (TIINGO_API_TOKEN) {
    try {
      const points = await fetchTiingoDailyCloses(upper, range, fromOverride);
      if (points.length >= 2) return { points, source: 'tiingo' };
      errors.push('Tiingo returned insufficient data');
    } catch (error) {
      errors.push(`Tiingo: ${error.message}`);
    }
  }

  try {
    const points = await fetchEodDailyCloses(upper, range, fromOverride);
    if (points.length >= 2) {
      console.warn(
        `[stocks] Using EOD fallback for ${upper} history (Finnhub free tier lacks US daily candles).`,
      );
      return { points, source: 'eod' };
    }
    errors.push('EOD fallback returned insufficient data');
  } catch (error) {
    errors.push(`EOD: ${error.message}`);
  }

  throw new Error(errors.join('; '));
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

async function getDailyCloses(symbol, range = '1mo', fromOverride = null) {
  const upper = String(symbol).toUpperCase();
  const cacheKey = `${upper}:${range}:${fromOverride ?? 'auto'}`;
  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < 15 * 60_000) {
    return cached.data;
  }

  const { points, source } = await fetchDailyClosesForSymbol(
    upper,
    range,
    fromOverride,
  );
  if (points.length) {
    historyCache.set(cacheKey, { data: points, source, ts: Date.now() });
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
    const fromQuery = req.query.from != null ? Number(req.query.from) : null;
    const fromOverride =
      fromQuery != null && Number.isFinite(fromQuery) && fromQuery > 0
        ? fromQuery
        : null;
    const points = await getDailyCloses(symbol, range, fromOverride);

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
