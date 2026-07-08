import { getAdCashRewardAmount } from "../utils/cashRewards";

export type AdReward = {
  id: string;
  amount: number;
};

/** Functional shop earn paths only — IAP packs stay hidden until purchase works. */
export function getShopAdRewards(): AdReward[] {
  return [{ id: "ad-cash", amount: getAdCashRewardAmount() }];
}
