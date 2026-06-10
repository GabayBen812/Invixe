export type NormalizedHolding = {
  id: string;
  symbol: string;
  shares: number;
  avgPrice: number;
};

export type NormalizedStockPrice = {
  symbol: string;
  price: number;
  changePercent: number;
};

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : fallback;
}

export function normalizePortfolioHolding(raw: Record<string, unknown>): NormalizedHolding {
  const symbol = String(raw.symbol ?? "").toUpperCase();
  return {
    id: String(raw.id ?? symbol),
    symbol,
    shares: toNumber(raw.shares),
    avgPrice: toNumber(
      raw.avgPrice ?? raw.avgprice ?? raw.avg_price ?? raw.averagePrice,
    ),
  };
}

export function normalizeStockPrice(raw: Record<string, unknown>): NormalizedStockPrice | null {
  const symbol = String(raw.symbol ?? "").toUpperCase();
  if (!symbol) return null;
  const price = toNumber(raw.price);
  return {
    symbol,
    price,
    changePercent: toNumber(raw.changePercent ?? raw.changepercent ?? raw.change_percent),
  };
}

export function formatIls(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `₪${Math.round(safe).toLocaleString("he-IL")}`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0.0%";
  const sign = value > 0.05 ? "+" : value < -0.05 ? "" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatUsd(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `$${safe.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function computePortfolioStats(
  holdings: NormalizedHolding[],
  priceBySymbol: Map<string, NormalizedStockPrice>,
) {
  let totalValue = 0;
  let totalCost = 0;
  for (const h of holdings) {
    const quote = priceBySymbol.get(h.symbol.toUpperCase());
    const price = quote?.price ?? h.avgPrice;
    totalValue += h.shares * price;
    totalCost += h.shares * h.avgPrice;
  }
  const gainLoss = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
  return { totalValue, totalCost, gainLoss, gainPercent };
}

export function getHoldingMarketPrice(
  holding: NormalizedHolding,
  priceBySymbol: Map<string, NormalizedStockPrice>,
): number {
  const quote = priceBySymbol.get(holding.symbol.toUpperCase());
  const price = quote?.price ?? holding.avgPrice;
  return Number.isFinite(price) ? price : 0;
}

export function getHoldingGainPercent(
  holding: NormalizedHolding,
  priceBySymbol: Map<string, NormalizedStockPrice>,
): number {
  const quote = priceBySymbol.get(holding.symbol.toUpperCase());
  if (quote && Number.isFinite(quote.changePercent) && quote.changePercent !== 0) {
    return quote.changePercent;
  }
  if (holding.avgPrice <= 0) return 0;
  const current = getHoldingMarketPrice(holding, priceBySymbol);
  return ((current - holding.avgPrice) / holding.avgPrice) * 100;
}
