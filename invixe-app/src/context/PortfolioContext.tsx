import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import {
  NormalizedHolding,
  NormalizedStockPrice,
  computePortfolioStats,
  getHoldingGainPercent,
  normalizePortfolioHolding,
  normalizeStockPrice,
} from "../utils/portfolioNormalize";
import {
  buildPortfolioHistorySeries,
  computePeriodReturns,
  getAccountStartMs,
  historyMarketValues,
  resolveHistoryRange,
  type PortfolioHistoryPoint,
  type PortfolioPeriodReturns,
  type TradeLike,
} from "../utils/portfolioHistory";

type LessonAttemptLike = {
  lessonId: number;
  lastAttempted: Date | string;
};

type PortfolioProviderProps = {
  children: React.ReactNode;
  currentUserEmail?: string | null;
  lessonAttempts?: LessonAttemptLike[];
};

type PortfolioContextValue = {
  holdings: NormalizedHolding[];
  stockPrices: NormalizedStockPrice[];
  loading: boolean;
  refreshPortfolio: () => Promise<void>;
  priceBySymbol: Map<string, NormalizedStockPrice>;
  getHolding: (symbol: string) => NormalizedHolding | undefined;
  getQuote: (symbol: string) => NormalizedStockPrice | undefined;
  getCurrentPrice: (symbol: string, fallback?: number) => number;
  getHoldingChangePercent: (holding: NormalizedHolding) => number;
  portfolioStats: ReturnType<typeof computePortfolioStats>;
  /** Market-value series for sparkline (oldest → newest). */
  portfolioHistory: number[];
  /** Full PnL-aware history points. */
  portfolioHistorySeries: PortfolioHistoryPoint[];
  /** Day / week / month portfolio performance %. */
  periodReturns: PortfolioPeriodReturns;
};

const EMPTY_PERIOD: PortfolioPeriodReturns = {
  day: null,
  week: null,
  month: null,
};

const PortfolioContext = createContext<PortfolioContextValue | undefined>(
  undefined,
);

async function fetchTradeHistory(email: string): Promise<TradeLike[]> {
  try {
    const url = `${API_BASE_URL}/user/portfolio/history?email=${encodeURIComponent(
      email,
    )}&limit=200`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    const rows = Array.isArray(data?.trades) ? data.trades : [];
    return rows
      .map((t: Record<string, unknown>) => ({
        type: t.type === "sell" ? ("sell" as const) : ("buy" as const),
        symbol: String(t.symbol || "").toUpperCase(),
        shares: Number(t.shares) || 0,
        price: Number(t.price) || 0,
        createdAt: String(t.createdAt || t.created_at || ""),
      }))
      .filter((t: TradeLike) => t.symbol && t.shares > 0 && t.price > 0 && t.createdAt);
  } catch {
    return [];
  }
}

export function PortfolioProvider({
  children,
  currentUserEmail = null,
  lessonAttempts = [],
}: PortfolioProviderProps) {
  const [holdings, setHoldings] = useState<NormalizedHolding[]>([]);
  const [stockPrices, setStockPrices] = useState<NormalizedStockPrice[]>([]);
  const [portfolioHistorySeries, setPortfolioHistorySeries] = useState<
    PortfolioHistoryPoint[]
  >([]);
  const [loading, setLoading] = useState(false);

  const refreshPortfolio = useCallback(async () => {
    if (!currentUserEmail) {
      setHoldings([]);
      setStockPrices([]);
      setPortfolioHistorySeries([]);
      return;
    }

    setLoading(true);
    try {
      const portfolioUrl = `${API_BASE_URL}/user/portfolio?email=${encodeURIComponent(currentUserEmail)}`;
      const [portfolioRes, trades] = await Promise.all([
        fetchWithTimeout(portfolioUrl),
        fetchTradeHistory(currentUserEmail),
      ]);
      if (!portfolioRes.ok) throw new Error("Failed to fetch portfolio");
      const portfolioData = await portfolioRes.json();
      const normalized = (portfolioData.portfolio || []).map(
        (row: Record<string, unknown>) => normalizePortfolioHolding(row),
      );
      setHoldings(normalized);

      if (normalized.length === 0) {
        setStockPrices([]);
        setPortfolioHistorySeries([]);
        return;
      }

      const symbols = normalized.map((h) => h.symbol);
      const pricesRes = await fetchWithTimeout(
        `${API_BASE_URL}/stocks/prices?symbols=${symbols.join(",")}`,
      );

      const apiPrices = pricesRes.ok
        ? ((await pricesRes.json()).prices || [])
            .map((row: Record<string, unknown>) => normalizeStockPrice(row))
            .filter(Boolean)
        : [];

      const bySymbol = new Map<string, NormalizedStockPrice>();
      for (const p of apiPrices as NormalizedStockPrice[]) {
        bySymbol.set(p.symbol.toUpperCase(), p);
      }

      const livePrices = new Map<string, number>();
      for (const [symbol, quote] of bySymbol) {
        if (quote.price > 0) livePrices.set(symbol, quote.price);
      }

      const lessonAttemptMs = lessonAttempts.map((attempt) =>
        new Date(attempt.lastAttempted).getTime(),
      );
      const accountStartMs = getAccountStartMs(trades, lessonAttemptMs);
      const accountStartTimestamp = Math.floor(accountStartMs / 1000);
      const historyRange = resolveHistoryRange(accountStartMs);

      const series = await buildPortfolioHistorySeries(normalized, {
        range: historyRange,
        trades,
        livePrices,
        accountStartTimestamp,
      });

      setStockPrices([...bySymbol.values()]);
      setPortfolioHistorySeries(series);
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail, lessonAttempts]);

  useEffect(() => {
    void refreshPortfolio();
  }, [refreshPortfolio]);

  const priceBySymbol = useMemo(() => {
    const map = new Map<string, NormalizedStockPrice>();
    stockPrices.forEach((p) => map.set(p.symbol.toUpperCase(), p));
    return map;
  }, [stockPrices]);

  const getHolding = useCallback(
    (symbol: string) =>
      holdings.find((h) => h.symbol.toUpperCase() === symbol.toUpperCase()),
    [holdings],
  );

  const getQuote = useCallback(
    (symbol: string) => priceBySymbol.get(symbol.toUpperCase()),
    [priceBySymbol],
  );

  const getCurrentPrice = useCallback(
    (symbol: string, fallback = 0) => {
      const holding = getHolding(symbol);
      const quote = getQuote(symbol);
      const price = quote?.price ?? holding?.avgPrice ?? fallback;
      return Number.isFinite(price) ? price : 0;
    },
    [getHolding, getQuote],
  );

  const getHoldingChangePercent = useCallback(
    (holding: NormalizedHolding) =>
      getHoldingGainPercent(holding, priceBySymbol),
    [priceBySymbol],
  );

  const portfolioStats = useMemo(
    () => computePortfolioStats(holdings, priceBySymbol),
    [holdings, priceBySymbol],
  );

  const portfolioHistory = useMemo(
    () => historyMarketValues(portfolioHistorySeries),
    [portfolioHistorySeries],
  );

  const periodReturns = useMemo(
    () =>
      portfolioHistorySeries.length >= 2
        ? computePeriodReturns(portfolioHistorySeries)
        : EMPTY_PERIOD,
    [portfolioHistorySeries],
  );

  const value = useMemo(
    () => ({
      holdings,
      stockPrices,
      loading,
      refreshPortfolio,
      priceBySymbol,
      getHolding,
      getQuote,
      getCurrentPrice,
      getHoldingChangePercent,
      portfolioStats,
      portfolioHistory,
      portfolioHistorySeries,
      periodReturns,
    }),
    [
      holdings,
      stockPrices,
      loading,
      refreshPortfolio,
      priceBySymbol,
      getHolding,
      getQuote,
      getCurrentPrice,
      getHoldingChangePercent,
      portfolioStats,
      portfolioHistory,
      portfolioHistorySeries,
      periodReturns,
    ],
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolio must be used within PortfolioProvider");
  }
  return ctx;
}
