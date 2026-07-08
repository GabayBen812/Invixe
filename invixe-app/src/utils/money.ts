/**
 * App cash display currency.
 * Game cash is portfolio money (buy stocks). Format is configurable — not USD-coupled in call sites.
 */
export const APP_CURRENCY = {
  code: "USD",
  symbol: "$",
  locale: "en-US",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const;

export function formatMoney(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const formatted = safe.toLocaleString(APP_CURRENCY.locale, {
    minimumFractionDigits: APP_CURRENCY.minimumFractionDigits,
    maximumFractionDigits: APP_CURRENCY.maximumFractionDigits,
  });
  return `${APP_CURRENCY.symbol}${formatted}`;
}
