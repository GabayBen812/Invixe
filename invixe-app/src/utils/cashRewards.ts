/**
 * Portfolio-first cash rewards.
 *
 * Objective: a new player starting near zero cash should afford ~1 entry share
 * after FIRST_BUY_LESSON_COUNT completed sublessons.
 *
 * All lesson/ad cash amounts should flow through this module.
 */

/** Conservative cost of one starter share in the trading universe (game cash units). */
export const TARGET_FIRST_SHARE_COST = 150;

/** Sublessons needed before a new player can buy their first share. */
export const FIRST_BUY_LESSON_COUNT = 3;

/** Base cash grant per completed sublesson to hit the first-buy objective. */
export const CASH_PER_EARLY_LESSON = Math.ceil(
  TARGET_FIRST_SHARE_COST / FIRST_BUY_LESSON_COUNT,
);

/** After the early ramp, keep per-lesson cash meaningful but slower. */
export const LATE_LESSON_CASH_FACTOR = 0.55;

/** Content `rewards` points contribute this much cash each. */
export const CONTENT_REWARD_TO_CASH = 2;

/** Fallback cash per correct graded drill when content has no rewards. */
export const FALLBACK_DRILL_CASH = 8;

/** Ad cash ≈ half a starter share — feels like real portfolio progress. */
export const AD_CASH_REWARD = Math.ceil(TARGET_FIRST_SHARE_COST / 2);

export type LessonCashAwardInput = {
  /** Sum of content activity.rewards earned this lesson (session). */
  contentRewardsTotal: number;
  /** Number of correctly answered graded drills. */
  correctDrillCount: number;
  /** How many sublessons the user has already completed before this one. */
  completedLessonsBefore: number;
};

/**
 * Cash to grant when a sublesson is completed (persisted once via /user/add-coins).
 */
export function computeLessonCashEarned(input: LessonCashAwardInput): number {
  const {
    contentRewardsTotal,
    correctDrillCount,
    completedLessonsBefore,
  } = input;

  const early =
    completedLessonsBefore < FIRST_BUY_LESSON_COUNT
      ? CASH_PER_EARLY_LESSON
      : Math.max(
          1,
          Math.round(CASH_PER_EARLY_LESSON * LATE_LESSON_CASH_FACTOR),
        );

  const fromContent = Math.max(0, contentRewardsTotal) * CONTENT_REWARD_TO_CASH;
  const fromDrills =
    fromContent > 0
      ? 0
      : Math.max(0, correctDrillCount) * FALLBACK_DRILL_CASH;

  return Math.max(0, Math.round(early + fromContent + fromDrills));
}

export function getAdCashRewardAmount(): number {
  return AD_CASH_REWARD;
}
