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
