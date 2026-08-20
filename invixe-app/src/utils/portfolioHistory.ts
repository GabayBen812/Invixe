import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout } from "./fetchWithTimeout";
import type { NormalizedHolding } from "./portfolioNormalize";

export type PricePoint = {
  /** Unix seconds (UTC day). */
  timestamp: number;
  close: number;
};

export type PortfolioHistoryPoint = {
  timestamp: number;
  /** Σ shares × close for that day. */
  marketValue: number;
  /** Σ shares × avg cost for the position held that day. */
  costBasis: number;
  /** marketValue − costBasis */
  pnl: number;
  /** Unrealized PnL % vs cost that day. */
  pnlPercent: number;
};

export type PortfolioPeriodReturns = {
  day: number | null;
  week: number | null;
  month: number | null;
};

export type PortfolioChartPeriod = "day" | "week" | "month";

export type TradeLike = {
  type: "buy" | "sell";
  symbol: string;
  shares: number;
  price: number;
  createdAt: string;
};

type LotState = {
  shares: number;
  avgPrice: number;
};

async function fetchApiDailyCloses(
  symbol: string,
  range = "1mo",
  fromTimestamp?: number,
): Promise<PricePoint[]> {
  const upper = symbol.toUpperCase();
  let url = `${API_BASE_URL}/stocks/${encodeURIComponent(upper)}/history?range=${encodeURIComponent(range)}`;
  if (fromTimestamp != null && fromTimestamp > 0) {
    url += `&from=${Math.floor(fromTimestamp)}`;
  }
  const response = await fetchWithTimeout(url);
  if (!response.ok) return [];

  const json = await response.json();
  const rawPoints: { timestamp?: number; close?: number }[] =
    json?.points ?? [];

  const points: PricePoint[] = [];
  for (const point of rawPoints) {
    const close = Number(point.close);
    const timestamp = Number(point.timestamp);
    if (!Number.isFinite(close) || close <= 0) continue;
    if (!Number.isFinite(timestamp) || timestamp <= 0) continue;
    points.push({ timestamp, close });
  }
  return points;
}

async function fetchDailyCloses(
  symbol: string,
  range = "1mo",
  fromTimestamp?: number,
): Promise<PricePoint[]> {
  try {
    return await fetchApiDailyCloses(symbol, range, fromTimestamp);
  } catch {
    return [];
  }
}

function dayKey(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function applyTrade(state: LotState, trade: TradeLike): LotState {
  const qty = Math.max(0, Math.floor(Number(trade.shares) || 0));
  const price = Number(trade.price) || 0;
  if (qty <= 0 || price <= 0) return state;

  if (trade.type === "buy") {
    const nextShares = state.shares + qty;
    const nextAvg =
      nextShares > 0
        ? (state.shares * state.avgPrice + qty * price) / nextShares
        : 0;
    return { shares: nextShares, avgPrice: nextAvg };
  }

  const sellQty = Math.min(state.shares, qty);
  return {
    shares: Math.max(0, state.shares - sellQty),
    avgPrice: state.shares - sellQty > 0 ? state.avgPrice : 0,
  };
}

/**
 * Lot timeline for historical mark-to-market.
 *
 * Default (and always-safe) path: current holdings for every day — uses each
 * share's avg price + quantity vs daily closes. Incomplete trade logs must NOT
 * zero out the series (that hid the sparkline / period %).
 *
 * When trade replay fully matches current holdings, use event-based lots so
 * buy/sell timing is reflected in the curve.
 */
function buildLotTimeline(
  holdings: NormalizedHolding[],
  trades: TradeLike[],
): {
  initial: Map<string, LotState>;
  events: { atMs: number; lots: Map<string, LotState> }[];
} {
  const currentBySymbol = new Map<string, LotState>();
  for (const h of holdings) {
    if (!(h.shares > 0)) continue;
    currentBySymbol.set(h.symbol.toUpperCase(), {
      shares: h.shares,
      avgPrice: h.avgPrice,
    });
  }

  const sorted = [...trades]
    .filter((t) => t.shares > 0 && t.price > 0 && t.createdAt)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  if (sorted.length === 0 || currentBySymbol.size === 0) {
    return { initial: currentBySymbol, events: [] };
  }

  const symbols = new Set([
    ...currentBySymbol.keys(),
    ...sorted.map((t) => String(t.symbol).toUpperCase()),
  ]);

  const lots = new Map<string, LotState>();
  for (const symbol of symbols) {
    lots.set(symbol, { shares: 0, avgPrice: 0 });
  }

  const events: { atMs: number; lots: Map<string, LotState> }[] = [];
  for (const trade of sorted) {
    const symbol = String(trade.symbol).toUpperCase();
    const prev = lots.get(symbol) ?? { shares: 0, avgPrice: 0 };
    lots.set(symbol, applyTrade(prev, trade));
    const snapshot = new Map<string, LotState>();
    for (const [sym, lot] of lots) {
      snapshot.set(sym, { ...lot });
    }
    events.push({
      atMs: new Date(trade.createdAt).getTime(),
      lots: snapshot,
    });
  }

  const finalLots = events[events.length - 1]?.lots ?? lots;
  let matchesCurrent = true;
  for (const [symbol, current] of currentBySymbol) {
    const replayed = finalLots.get(symbol) ?? { shares: 0, avgPrice: 0 };
    if (Math.abs(replayed.shares - current.shares) > 0.001) {
      matchesCurrent = false;
      break;
    }
  }
  for (const [symbol, lot] of finalLots) {
    if (lot.shares <= 0) continue;
    if (!currentBySymbol.has(symbol)) {
      matchesCurrent = false;
      break;
    }
  }

  // Incomplete history (buys before TradeHistory existed) → keep steady lots.
  if (!matchesCurrent) {
    return { initial: currentBySymbol, events: [] };
  }

  const initial = new Map<string, LotState>();
  for (const symbol of symbols) {
    initial.set(symbol, { shares: 0, avgPrice: 0 });
  }
  return { initial, events };
}

function lotsAsOf(
  initial: Map<string, LotState>,
  events: { atMs: number; lots: Map<string, LotState> }[],
  asOfMs: number,
): Map<string, LotState> {
  let current = initial;
  for (const event of events) {
    if (event.atMs > asOfMs) break;
    current = event.lots;
  }
  return current;
}

function closeOnOrBefore(
  pointsByDay: Map<string, number>,
  sortedDays: string[],
  targetDay: string,
): number | null {
  // Binary-ish walk: last day <= target
  let answer: number | null = null;
  for (const day of sortedDays) {
    if (day > targetDay) break;
    const close = pointsByDay.get(day);
    if (close != null) answer = close;
  }
  return answer;
}

export type BuildPortfolioHistoryOptions = {
  range?: string;
  trades?: TradeLike[];
  /** Unix seconds — trim series to account activity start (all-time chart). */
  accountStartTimestamp?: number;
  /** Live tip prices (symbol → last price) to refresh the newest point. */
  livePrices?: Map<string, number>;
};

/** Earliest meaningful account activity for all-time portfolio chart. */
export function getAccountStartMs(
  trades: TradeLike[],
  lessonAttemptMs: number[] = [],
): number {
  const candidates: number[] = [];
  for (const trade of trades) {
    const ms = new Date(trade.createdAt).getTime();
    if (Number.isFinite(ms) && ms > 0) candidates.push(ms);
  }
  for (const ms of lessonAttemptMs) {
    if (Number.isFinite(ms) && ms > 0) candidates.push(ms);
  }
  if (!candidates.length) {
    return Date.now() - 365 * 24 * 60 * 60 * 1000;
  }
  return Math.min(...candidates);
}

/** Pick the widest Finnhub range that covers account age (max 1y). */
export function resolveHistoryRange(accountStartMs: number): string {
  const ageDays = (Date.now() - accountStartMs) / (24 * 60 * 60 * 1000);
  if (ageDays <= 7) return "1w";
  if (ageDays <= 30) return "1mo";
  if (ageDays <= 90) return "3mo";
  if (ageDays <= 180) return "6mo";
  return "1y";
}

const PERIOD_CUTOFF_SECONDS: Record<PortfolioChartPeriod, number> = {
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
};

/** Slice full series to day / week / month window (null = all-time). */
export function filterSeriesByPeriod(
  series: PortfolioHistoryPoint[],
  period: PortfolioChartPeriod | null,
): PortfolioHistoryPoint[] {
  if (!series.length || period == null) return series;
  const lastTs = series[series.length - 1].timestamp;
  const cutoff = lastTs - PERIOD_CUTOFF_SECONDS[period];
  const filtered = series.filter((point) => point.timestamp >= cutoff);
  if (filtered.length >= 2) return filtered;
  return series.length >= 2 ? series.slice(-2) : series;
}

/** Return % change from first → last point in a (possibly filtered) series. */
export function periodReturnForSeries(
  series: PortfolioHistoryPoint[],
): number | null {
  if (series.length < 2) return null;
  const first = series[0];
  const last = series[series.length - 1];
  if (!(first.marketValue > 0)) return null;
  if (first === last) return 0;
  return ((last.marketValue - first.marketValue) / first.marketValue) * 100;
}

/**
 * Build date-aligned portfolio history with accurate market value + cost + PnL.
 * Cost uses avg price × shares for the position as-of each day (from trades when available).
 */
export async function buildPortfolioHistorySeries(
  holdings: NormalizedHolding[],
  options: BuildPortfolioHistoryOptions = {},
): Promise<PortfolioHistoryPoint[]> {
  const trades = options.trades ?? [];
  const accountStartSec =
    options.accountStartTimestamp != null && options.accountStartTimestamp > 0
      ? Math.floor(options.accountStartTimestamp)
      : undefined;
  const range =
    options.range ??
    resolveHistoryRange(
      accountStartSec != null ? accountStartSec * 1000 : Date.now(),
    );
  if (!holdings.length && !trades.length) return [];

  const symbols = [
    ...new Set([
      ...holdings.map((h) => h.symbol.toUpperCase()),
      ...trades.map((t) => String(t.symbol).toUpperCase()),
    ]),
  ].filter(Boolean);

  if (!symbols.length) return [];

  const fetchRange = async (requestedRange: string) =>
    Promise.all(
      symbols.map(async (symbol) => ({
        symbol,
        points: await fetchDailyCloses(
          symbol,
          requestedRange,
          accountStartSec,
        ),
      })),
    );

  let histories = await fetchRange(range);

  const countUsableDays = (rows: typeof histories) => {
    const days = new Set<string>();
    for (const hist of rows) {
      if (hist.points.length < 2) continue;
      for (const p of hist.points) days.add(dayKey(p.timestamp));
    }
    return days.size;
  };

  if (countUsableDays(histories) < 2 && range !== "1y") {
    histories = await fetchRange("1y");
  }

  // Only symbols with usable price history participate in the calendar.
  // Still mark lots for all held symbols using last-known / avg price.
  const bySymbolDay = new Map<string, Map<string, number>>();
  const allDays = new Set<string>();

  for (const hist of histories) {
    if (hist.points.length < 2) continue;
    const dayMap = new Map<string, number>();
    for (const p of hist.points) {
      const key = dayKey(p.timestamp);
      dayMap.set(key, p.close);
      allDays.add(key);
    }
    bySymbolDay.set(hist.symbol, dayMap);
  }

  // No daily history available — do not fabricate a smooth growth curve.
  if (allDays.size < 2) {
    const nowSec = Math.floor(Date.now() / 1000);
    const { initial, events } = buildLotTimeline(holdings, trades);
    const lotsNow = lotsAsOf(initial, events, Date.now());
    let marketValue = 0;
    let costBasis = 0;
    for (const symbol of symbols) {
      const lot = lotsNow.get(symbol);
      if (!lot || lot.shares <= 0) continue;
      const live = options.livePrices?.get(symbol);
      const price = live && live > 0 ? live : lot.avgPrice;
      marketValue += lot.shares * price;
      costBasis += lot.shares * lot.avgPrice;
    }
    if (!(marketValue > 0)) return [];
    const pnl = marketValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return [
      {
        timestamp: nowSec - 24 * 60 * 60,
        marketValue: costBasis > 0 ? costBasis : marketValue,
        costBasis,
        pnl: 0,
        pnlPercent: 0,
      },
      {
        timestamp: nowSec,
        marketValue,
        costBasis,
        pnl,
        pnlPercent,
      },
    ];
  }

  const sortedDays = [...allDays].sort();
  const dayTimestamp = new Map<string, number>();
  for (const hist of histories) {
    for (const p of hist.points) {
      const key = dayKey(p.timestamp);
      // Prefer earliest bar time for that UTC day
      const existing = dayTimestamp.get(key);
      if (existing == null || p.timestamp < existing) {
        dayTimestamp.set(key, p.timestamp);
      }
    }
  }

  const { initial, events } = buildLotTimeline(holdings, trades);
  const series: PortfolioHistoryPoint[] = [];

  for (const day of sortedDays) {
    const ts = dayTimestamp.get(day) ?? 0;
    const asOfMs = (ts + 24 * 60 * 60 - 1) * 1000; // end of that day
    const lots = lotsAsOf(initial, events, asOfMs);

    let marketValue = 0;
    let costBasis = 0;
    let heldSomething = false;

    for (const symbol of symbols) {
      const lot = lots.get(symbol);
      if (!lot || lot.shares <= 0) continue;
      heldSomething = true;

      const dayMap = bySymbolDay.get(symbol);
      const sortedSymDays = dayMap ? [...dayMap.keys()].sort() : [];
      const close =
        (dayMap && closeOnOrBefore(dayMap, sortedSymDays, day)) ??
        lot.avgPrice;

      marketValue += lot.shares * close;
      costBasis += lot.shares * lot.avgPrice;
    }

    if (!heldSomething) continue;
    if (!(marketValue > 0) || !(costBasis >= 0)) continue;

    const pnl = marketValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    series.push({
      timestamp: ts,
      marketValue,
      costBasis,
      pnl,
      pnlPercent,
    });
  }

  // Refresh last point with live quotes when available (still using latest lots).
  if (series.length > 0 && options.livePrices && options.livePrices.size > 0) {
    const last = series[series.length - 1];
    const lots = lotsAsOf(initial, events, Date.now());
    let marketValue = 0;
    let costBasis = 0;
    for (const symbol of symbols) {
      const lot = lots.get(symbol);
      if (!lot || lot.shares <= 0) continue;
      const live = options.livePrices.get(symbol);
      const price = live && live > 0 ? live : lot.avgPrice;
      marketValue += lot.shares * price;
      costBasis += lot.shares * lot.avgPrice;
    }
    if (marketValue > 0) {
      const pnl = marketValue - costBasis;
      series[series.length - 1] = {
        ...last,
        timestamp: Math.floor(Date.now() / 1000),
        marketValue,
        costBasis,
        pnl,
        pnlPercent: costBasis > 0 ? (pnl / costBasis) * 100 : 0,
      };
    }
  }

  return trimSeriesToAccountStart(series, accountStartSec);
}

function trimSeriesToAccountStart(
  series: PortfolioHistoryPoint[],
  accountStartSec?: number,
): PortfolioHistoryPoint[] {
  if (!series.length || accountStartSec == null) return series;
  const trimmed = series.filter((point) => point.timestamp >= accountStartSec);
  return trimmed.length >= 2 ? trimmed : series;
}

/** Back-compat: market-value numbers only (oldest → newest). */
export async function buildPortfolioHistory(
  holdings: NormalizedHolding[],
  range = "1mo",
): Promise<number[]> {
  const series = await buildPortfolioHistorySeries(holdings, { range });
  return series.map((p) => p.marketValue);
}

/**
 * Period returns from market-value time series (portfolio performance),
 * using calendar spacing rather than fragile fixed indices.
 */
export function computePeriodReturns(
  series: PortfolioHistoryPoint[],
): PortfolioPeriodReturns {
  if (series.length < 2) {
    return { day: null, week: null, month: null };
  }

  const last = series[series.length - 1];
  const lastTs = last.timestamp;

  const findAtOrBefore = (minAgeSeconds: number): PortfolioHistoryPoint | null => {
    const target = lastTs - minAgeSeconds;
    let candidate: PortfolioHistoryPoint | null = null;
    for (const point of series) {
      if (point.timestamp <= target) candidate = point;
      else break;
    }
    // If nothing is old enough, use earliest point for "month"-like ranges.
    return candidate;
  };

  const pct = (
    from: PortfolioHistoryPoint | null,
  ): number | null => {
    if (!from || !(from.marketValue > 0)) return null;
    if (from === last) return 0;
    return ((last.marketValue - from.marketValue) / from.marketValue) * 100;
  };

  // Prefer previous trading point for day; fall back to ~24h lookback.
  const prev = series[series.length - 2] ?? null;
  const day =
    prev && prev.marketValue > 0
      ? ((last.marketValue - prev.marketValue) / prev.marketValue) * 100
      : pct(findAtOrBefore(24 * 60 * 60));

  const week = pct(findAtOrBefore(7 * 24 * 60 * 60));
  const monthPoint = findAtOrBefore(30 * 24 * 60 * 60) ?? series[0];
  const month = pct(monthPoint);

  return { day, week, month };
}

/** Sparkline values — plot market value through time. */
export function historyMarketValues(
  series: PortfolioHistoryPoint[],
): number[] {
  return series.map((p) => p.marketValue);
}

/** Sparkline values — plot unrealized PnL $ through time. */
export function historyPnlValues(series: PortfolioHistoryPoint[]): number[] {
  return series.map((p) => p.pnl);
}
