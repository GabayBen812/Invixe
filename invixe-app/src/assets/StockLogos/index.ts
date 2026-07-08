import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import Apple from "./aapl.svg";
import Google from "./googl.svg";
import Microsoft from "./msft.svg";
import Amazon from "./amzn.svg";
import Tesla from "./tsla.svg";
import Meta from "./meta.svg";
import Nvidia from "./nvda.svg";
import Netflix from "./nflx.svg";

type StockLogo = FC<SvgProps>;

/**
 * Ticker -> official logo mark, bundled locally so Holdings avatars don't
 * depend on a runtime logo-fetch service. To support a new tradable company,
 * drop its logo .svg here and add one entry to this map.
 */
const STOCK_LOGOS: Record<string, StockLogo> = {
  AAPL: Apple,
  GOOGL: Google,
  MSFT: Microsoft,
  AMZN: Amazon,
  TSLA: Tesla,
  META: Meta,
  NVDA: Nvidia,
  NFLX: Netflix,
};

export function getStockLogo(symbol: string): StockLogo | undefined {
  return STOCK_LOGOS[symbol.trim().toUpperCase()];
}
