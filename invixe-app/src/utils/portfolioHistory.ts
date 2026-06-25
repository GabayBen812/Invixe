import { fetchWithTimeout } from "./fetchWithTimeout";
import type { NormalizedHolding } from "./portfolioNormalize";

const YAHOO_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

export type PricePoint = {
  timestamp: number;
  close: number;
};

async function fetchYahooDailyCloses(
  symbol: string,
  range = "1mo",
): Promise<PricePoint[]> {
  const upper = symbol.toUpperCase();
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(upper)}?interval=1d&range=${range}`;
  const response = await fetchWithTimeout(url, {
    headers: { "User-Agent": YAHOO_UA },
  });
  if (!response.ok) return [];

  const json = await response.json();
  const result = json?.chart?.result?.[0];
  const timestamps: number[] = result?.timestamp ?? [];
  const closes: (number | null)[] =
    result?.indicators?.quote?.[0]?.close ?? [];

  const points: PricePoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close == null || !Number.isFinite(close)) continue;
    points.push({ timestamp: timestamps[i], close });
  }
  return points;
}

/** Portfolio market value per trading day (sum of shares × close). */
export async function buildPortfolioHistory(
  holdings: NormalizedHolding[],
  range = "1mo",
): Promise<number[]> {
  if (!holdings.length) return [];

  const histories = await Promise.all(
    holdings.map(async (h) => ({
      symbol: h.symbol.toUpperCase(),
      points: await fetchYahooDailyCloses(h.symbol, range),
    })),
  );

  const usable = histories.filter((h) => h.points.length >= 2);
  if (!usable.length) return [];

  const minLen = Math.min(...usable.map((h) => h.points.length));
  const values: number[] = [];

  for (let i = 0; i < minLen; i++) {
    let total = 0;
    for (const holding of holdings) {
      const hist = usable.find((h) => h.symbol === holding.symbol.toUpperCase());
      if (!hist) {
        total += holding.shares * holding.avgPrice;
        continue;
      }
      const idx = hist.points.length - minLen + i;
      const close = hist.points[idx]?.close ?? holding.avgPrice;
      total += holding.shares * close;
    }
    values.push(total);
  }

  return values.filter((v) => Number.isFinite(v) && v > 0);
}
