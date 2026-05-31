export type CoinPack = {
  id: string;
  title: string;
  amount: number;
  priceLabel: string;
  popular?: boolean;
  bonusLabel?: string;
  bonusTone?: "blue" | "purple";
};

export type LightningPack = {
  id: string;
  amount: number;
  priceLabel: string;
  boltCount: 1 | 2 | 3;
};

export type AdReward = {
  id: string;
  kind: "coins" | "lightning";
  amount: number;
};

export const COIN_PACKS: CoinPack[] = [
  {
    id: "starter",
    title: "Starter Pack",
    amount: 5000,
    priceLabel: "₪9.90",
  },
  {
    id: "trader",
    title: "Trader Pack",
    amount: 15000,
    priceLabel: "₪24.90",
    popular: true,
    bonusLabel: "+5% BONUS",
    bonusTone: "blue",
  },
  {
    id: "whale",
    title: "Whale Pack",
    amount: 50000,
    priceLabel: "₪69.90",
    bonusLabel: "+20% BONUS",
    bonusTone: "purple",
  },
];

export const LIGHTNING_PACKS: LightningPack[] = [
  { id: "energy-10", amount: 10, priceLabel: "₪4.90", boltCount: 1 },
  { id: "energy-30", amount: 30, priceLabel: "₪9.90", boltCount: 2 },
  { id: "energy-80", amount: 80, priceLabel: "₪19.90", boltCount: 3 },
];

export const AD_REWARDS: AdReward[] = [
  { id: "ad-coins", kind: "coins", amount: 100 },
  { id: "ad-lightning", kind: "lightning", amount: 1 },
];

export const PREMIUM_FEATURES = [
  { id: "no-ads", label: "ללא פרסומות", icon: "block" as const },
  { id: "unlimited", label: "ללא הגבלה", icon: "infinity" as const },
  { id: "skip", label: "דילוג", icon: "skip" as const },
  { id: "xp", label: "XP מוגבר", icon: "rocket" as const },
];
