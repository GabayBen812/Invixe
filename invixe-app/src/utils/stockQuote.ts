import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout } from "./fetchWithTimeout";

export type StockQuote = {
  symbol: string;
  price: number;
  changePercent: number;
};

async function fetchApiQuote(symbol: string): Promise<StockQuote | null> {
  const upper = symbol.toUpperCase();
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/stocks/${encodeURIComponent(upper)}/price`,
  );
  if (!response.ok) return null;

  const data = await response.json();
  if (!data?.price) return null;

  return {
    symbol: upper,
    price: Number(data.price),
    changePercent: Number(data.changePercent ?? 0),
  };
}

/** Live quote from Invixe backend (Finnhub via server). */
export async function fetchLiveStockQuote(
  symbol: string,
): Promise<StockQuote | null> {
  const upper = symbol.toUpperCase();

  try {
    const api = await fetchApiQuote(upper);
    if (api && api.price > 0) return api;
  } catch {
    // no quote available
  }

  return null;
}
