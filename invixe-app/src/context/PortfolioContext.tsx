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
  getHoldingMarketPrice,
  normalizePortfolioHolding,
  normalizeStockPrice,
} from "../utils/portfolioNormalize";
import { useUser } from "./UserContext";

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
};

const PortfolioContext = createContext<PortfolioContextValue | undefined>(
  undefined,
);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { currentUserEmail } = useUser();
  const [holdings, setHoldings] = useState<NormalizedHolding[]>([]);
  const [stockPrices, setStockPrices] = useState<NormalizedStockPrice[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshPortfolio = useCallback(async () => {
    if (!currentUserEmail) {
      setHoldings([]);
      setStockPrices([]);
      return;
    }

    setLoading(true);
    try {
      const portfolioUrl = `${API_BASE_URL}/user/portfolio?email=${encodeURIComponent(currentUserEmail)}`;
      const portfolioRes = await fetchWithTimeout(portfolioUrl);
      if (!portfolioRes.ok) throw new Error("Failed to fetch portfolio");
      const portfolioData = await portfolioRes.json();
      const normalized = (portfolioData.portfolio || []).map(
        (row: Record<string, unknown>) => normalizePortfolioHolding(row),
      );
      setHoldings(normalized);

      if (normalized.length === 0) {
        setStockPrices([]);
        return;
      }

      const symbols = normalized.map((h) => h.symbol).join(",");
      const pricesRes = await fetchWithTimeout(
        `${API_BASE_URL}/stocks/prices?symbols=${symbols}`,
      );
      if (!pricesRes.ok) throw new Error("Failed to fetch stock prices");
      const pricesData = await pricesRes.json();
      const prices = (pricesData.prices || [])
        .map((row: Record<string, unknown>) => normalizeStockPrice(row))
        .filter(Boolean) as NormalizedStockPrice[];
      setStockPrices(prices);
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail]);

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
