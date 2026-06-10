import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout } from "./fetchWithTimeout";

export type StockQuote = {
  symbol: string;
  price: number;
  changePercent: number;
};

const YAHOO_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  const upper = symbol.toUpperCase();
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(upper)}?interval=1d&range=1d`;
  const response = await fetchWithTimeout(url, {
    headers: { "User-Agent": YAHOO_UA },
  });
  if (!response.ok) return null;

  const json = await response.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) return null;

  const price = Number(meta.regularMarketPrice);
  const prev = Number(
    meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice,
  );
  const changePercent = prev ? ((price - prev) / prev) * 100 : 0;

  return { symbol: upper, price, changePercent };
}

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

/** Live quote — Yahoo first (matches chart), API as fallback. */
export async function fetchLiveStockQuote(
  symbol: string,
): Promise<StockQuote | null> {
  const upper = symbol.toUpperCase();

  try {
    const yahoo = await fetchYahooQuote(upper);
    if (yahoo && yahoo.price > 0) return yahoo;
  } catch {
    // try API next
  }

  try {
    const api = await fetchApiQuote(upper);
    if (api && api.price > 0) return api;
  } catch {
    // no quote available
  }

  return null;
}
