const express = require('express');
const router = express.Router();
const {
  MarketstackQuotaError,
  canUseMarketstack,
  getMarketstackUsage,
  recordMarketstackRequest,
} = require('../utils/marketstackQuota');

const MARKETSTACK_ACCESS_KEY = process.env.MARKETSTACK_ACCESS_KEY;
const TIINGO_API_TOKEN = process.env.TIINGO_API_TOKEN;

const MARKETSTACK_BASE = 'https://api.marketstack.com/v2';

/** EOD quotes only change once per day — cache aggressively. */
const QUOTE_CACHE_TTL_MS = 30 * 60 * 1000;
/** Daily history is stable until the next market close. */
const HISTORY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const quoteCache = new Map();
const historyCache = new Map();
const inflightQuotes = new Map();
const inflightHistory = new Map();
const CHART_UA =
  'Mozilla/5.0 (compatible; InvixeServer/1.0; +https://invixe.app)';

if (!MARKETSTACK_ACCESS_KEY) {
  console.warn(
    'MARKETSTACK_ACCESS_KEY is not set — stock quotes and history will be unavailable.',
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

function historyLimitForRange(range) {
  const calendarDays = rangeToDays(range);
  const tradingDays = Math.ceil(calendarDays * (5 / 7)) + 5;
  return Math.min(1000, Math.max(tradingDays, 10));
}

function parseMarketstackDate(dateStr) {
  const ms = Date.parse(String(dateStr || ''));
  if (!Number.isFinite(ms)) return 0;
  return Math.floor(ms / 1000);
}

function parseQuoteFromBars(symbol, bars) {
  const sorted = [...bars].sort(
    (a, b) => parseMarketstackDate(b.date) - parseMarketstackDate(a.date),
  );
  if (!sorted.length) {
    throw new Error('Marketstack quote missing price');
  }

  const latest = sorted[0];
  const price = Number(latest?.close);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Marketstack quote missing price');
  }

  const previousClose =
    sorted.length >= 2
      ? Number(sorted[1]?.close)
      : Number(latest?.open ?? price);
  const change = price - previousClose;
  const changePercent =
    previousClose > 0 ? (change / previousClose) * 100 : 0;

  return {
    symbol: String(symbol).toUpperCase(),
    price,
    change,
    changePercent,
  };
}

function parseQuoteFromHistoryPoints(symbol, points) {
  if (!Array.isArray(points) || points.length < 1) return null;

  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : latest;
  const price = Number(latest.close);
  const previousClose = Number(previous.close);
  if (!Number.isFinite(price) || price <= 0) return null;

  const change = price - previousClose;
  const changePercent =
    previousClose > 0 ? (change / previousClose) * 100 : 0;

  return {
    symbol: String(symbol).toUpperCase(),
    price,
    change,
    changePercent,
  };
}

function deriveQuoteFromHistoryCache(symbol) {
  const upper = String(symbol).toUpperCase();
  let bestPoints = null;
  let bestTs = 0;

  for (const [key, cached] of historyCache.entries()) {
    if (!key.startsWith(`${upper}:`)) continue;
    if (Date.now() - cached.ts > HISTORY_CACHE_TTL_MS) continue;
    if (!Array.isArray(cached.data) || cached.data.length < 1) continue;
    if (cached.ts > bestTs) {
      bestTs = cached.ts;
      bestPoints = cached.data;
    }
  }

  return parseQuoteFromHistoryPoints(upper, bestPoints);
}

async function marketstackGet(endpoint, params = {}) {
  if (!MARKETSTACK_ACCESS_KEY) {
    throw new Error('Marketstack access key not configured');
  }
  if (!canUseMarketstack()) {
    throw new MarketstackQuotaError();
  }

  const url = new URL(`${MARKETSTACK_BASE}${endpoint}`);
  url.searchParams.set('access_key', MARKETSTACK_ACCESS_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  recordMarketstackRequest();

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Marketstack request failed (${response.status})`);
  }

  const json = await response.json();
  if (json?.error) {
    const message =
      json.error?.message || json.error?.code || 'Marketstack API error';
    throw new Error(message);
  }

  return json;
}

function groupMarketstackBarsBySymbol(rows) {
  const bySymbol = new Map();
  for (const row of rows) {
    const sym = String(row?.symbol || '').toUpperCase();
    if (!sym) continue;
    if (!bySymbol.has(sym)) bySymbol.set(sym, []);
    bySymbol.get(sym).push(row);
  }
  return bySymbol;
}

async function fetchMarketstackQuotes(symbols) {
  const unique = [
    ...new Set(symbols.map((symbol) => String(symbol).toUpperCase())),
  ].filter(Boolean);
  if (!unique.length) return new Map();

  const to = new Date();
  const from = new Date(to.getTime() - 12 * 24 * 60 * 60 * 1000);
  const json = await marketstackGet('/eod', {
    symbols: unique.join(','),
    date_from: from.toISOString().slice(0, 10),
    date_to: to.toISOString().slice(0, 10),
    limit: Math.min(1000, unique.length * 4),
    sort: 'DESC',
  });

  const bySymbol = groupMarketstackBarsBySymbol(
    Array.isArray(json?.data) ? json.data : [],
  );
  const quotes = new Map();

  for (const symbol of unique) {
    const bars = bySymbol.get(symbol) || [];
    if (!bars.length) continue;
    quotes.set(symbol, parseQuoteFromBars(symbol, bars));
  }

  return quotes;
}

async function fetchMarketstackDailyCloses(
  symbol,
  range = '1mo',
  fromOverride = null,
) {
  const upper = String(symbol).toUpperCase();
  const to = new Date();
  const from =
    fromOverride != null && Number.isFinite(Number(fromOverride))
      ? new Date(Number(fromOverride) * 1000)
      : new Date(to.getTime() - rangeToDays(range) * 24 * 60 * 60 * 1000);

  const dateFrom = from.toISOString().slice(0, 10);
  const dateTo = to.toISOString().slice(0, 10);
  const limit = historyLimitForRange(range);

  const json = await marketstackGet('/eod', {
    symbols: upper,
    date_from: dateFrom,
    date_to: dateTo,
    limit,
    sort: 'ASC',
  });

  const points = [];
  for (const row of Array.isArray(json?.data) ? json.data : []) {
    const close = Number(row?.adj_close ?? row?.close);
    const timestamp = parseMarketstackDate(row?.date);
    if (!Number.isFinite(close) || close <= 0) continue;
    if (!Number.isFinite(timestamp) || timestamp <= 0) continue;
    points.push({ timestamp, close });
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

/** Yahoo chart fallback when Marketstack is unavailable or quota is exhausted. */
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

async function fetchYahooQuote(symbol) {
  const points = await fetchEodDailyCloses(symbol, '5d');
  const quote = parseQuoteFromHistoryPoints(symbol, points);
  if (!quote) {
    throw new Error('Yahoo quote missing price');
  }
  return quote;
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

  if (MARKETSTACK_ACCESS_KEY && canUseMarketstack()) {
    try {
      const points = await fetchMarketstackDailyCloses(upper, range, fromOverride);
      if (points.length >= 2) return { points, source: 'marketstack' };
      errors.push('Marketstack returned insufficient data');
    } catch (error) {
      if (error instanceof MarketstackQuotaError) {
        errors.push('Marketstack monthly quota exhausted');
      } else {
        errors.push(`Marketstack: ${error.message}`);
      }
    }
  } else if (!MARKETSTACK_ACCESS_KEY) {
    errors.push('Marketstack access key not configured');
  } else {
    errors.push('Marketstack monthly quota exhausted');
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
      console.warn(`[stocks] Using Yahoo EOD fallback for ${upper} history.`);
      return { points, source: 'eod' };
    }
    errors.push('EOD fallback returned insufficient data');
  } catch (error) {
    errors.push(`EOD: ${error.message}`);
  }

  throw new Error(errors.join('; '));
}

async function fetchQuoteWithFallback(symbol, { allowMarketstack = true } = {}) {
  const upper = String(symbol).toUpperCase();

  if (allowMarketstack && MARKETSTACK_ACCESS_KEY && canUseMarketstack()) {
    try {
      const quotes = await fetchMarketstackQuotes([upper]);
      const quote = quotes.get(upper);
      if (quote) return quote;
      throw new Error('Marketstack quote missing price');
    } catch (error) {
      if (!(error instanceof MarketstackQuotaError)) {
        console.warn(`[stocks] Marketstack quote failed for ${upper}:`, error.message);
      }
    }
  }

  return fetchYahooQuote(upper);
}

async function getLiveQuotes(symbols) {
  const unique = [
    ...new Set(symbols.map((symbol) => String(symbol).toUpperCase())),
  ].filter(Boolean);
  const results = new Map();
  const missing = [];

  for (const symbol of unique) {
    const cached = quoteCache.get(symbol);
    if (cached && Date.now() - cached.ts < QUOTE_CACHE_TTL_MS) {
      results.set(symbol, cached.data);
      continue;
    }

    const derived = deriveQuoteFromHistoryCache(symbol);
    if (derived) {
      quoteCache.set(symbol, { data: derived, ts: Date.now() });
      results.set(symbol, derived);
      continue;
    }

    missing.push(symbol);
  }

  if (!missing.length) {
    return unique.map((symbol) => results.get(symbol)).filter(Boolean);
  }

  const inflightKey = `batch:${missing.sort().join(',')}`;
  if (!inflightQuotes.has(inflightKey)) {
    inflightQuotes.set(
      inflightKey,
      (async () => {
        const fetched = new Map();

        if (MARKETSTACK_ACCESS_KEY && canUseMarketstack()) {
          try {
            const batch = await fetchMarketstackQuotes(missing);
            for (const [symbol, quote] of batch.entries()) {
              fetched.set(symbol, quote);
            }
          } catch (error) {
            if (!(error instanceof MarketstackQuotaError)) {
              console.warn('[stocks] Marketstack batch quote failed:', error.message);
            }
          }
        }

        for (const symbol of missing) {
          if (fetched.has(symbol)) continue;
          try {
            fetched.set(
              symbol,
              await fetchQuoteWithFallback(symbol, { allowMarketstack: false }),
            );
          } catch (error) {
            console.warn(`[stocks] Quote fallback failed for ${symbol}:`, error.message);
          }
        }

        return fetched;
      })().finally(() => {
        inflightQuotes.delete(inflightKey);
      }),
    );
  }

  const fetched = await inflightQuotes.get(inflightKey);
  for (const [symbol, quote] of fetched.entries()) {
    quoteCache.set(symbol, { data: quote, ts: Date.now() });
    results.set(symbol, quote);
  }

  return unique.map((symbol) => results.get(symbol)).filter(Boolean);
}

async function getLiveQuote(symbol) {
  const quotes = await getLiveQuotes([symbol]);
  if (!quotes.length) {
    throw new Error(`Quote unavailable for ${String(symbol).toUpperCase()}`);
  }
  return quotes[0];
}

async function getDailyCloses(symbol, range = '1mo', fromOverride = null) {
  const upper = String(symbol).toUpperCase();
  const cacheKey = `${upper}:${range}:${fromOverride ?? 'auto'}`;
  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < HISTORY_CACHE_TTL_MS) {
    return cached.data;
  }

  if (!inflightHistory.has(cacheKey)) {
    inflightHistory.set(
      cacheKey,
      (async () => {
        const { points, source } = await fetchDailyClosesForSymbol(
          upper,
          range,
          fromOverride,
        );
        if (points.length) {
          historyCache.set(cacheKey, { data: points, source, ts: Date.now() });
        }
        return points;
      })().finally(() => {
        inflightHistory.delete(cacheKey);
      }),
    );
  }

  return inflightHistory.get(cacheKey);
}

// GET Marketstack monthly usage (for ops/debug)
router.get('/usage', (_req, res) => {
  res.json(getMarketstackUsage());
});

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

    const prices = await getLiveQuotes(symbolList);

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
