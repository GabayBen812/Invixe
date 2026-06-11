-- ============================================================================
-- Dictionary unlock system
--
-- Adds a per-lesson configuration column `unlocksdictionary` (array of
-- dictionary entry ids). When a user completes a lesson, every entry id listed
-- here becomes unlocked in the app dictionary ("מילון מושגים").
--
-- The entry ids below match the ids defined in the app at
--   invixe-app/src/data/dictionary.ts
-- (term text + artwork live in the app; this column only controls UNLOCKS).
--
-- To wire a new lesson: edit its row and set the `unlocksdictionary` array,
-- e.g.  UPDATE "Lesson" SET unlocksdictionary = '{doji}' WHERE code = 207 ...
-- ============================================================================

ALTER TABLE "Lesson"
  ADD COLUMN IF NOT EXISTS unlocksdictionary TEXT[] DEFAULT '{}';

-- ---------------------------------------------------------------------------
-- Unit "ניתוח טכני" (candlesticks + support/resistance)
--   unitId = 24c681de-739d-4eae-983e-6644dc17203c
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  technical_unit UUID := '24c681de-739d-4eae-983e-6644dc17203c';
  basics_unit    UUID := '685400ec-e318-4281-9b31-78b237ce1cfe';
BEGIN
  -- Candle basics
  UPDATE "Lesson" SET unlocksdictionary = '{candle-structure}'
    WHERE unitid = technical_unit AND code = 103;          -- ללמוד לקרוא נר
  UPDATE "Lesson" SET unlocksdictionary = '{trend}'
    WHERE unitid = technical_unit AND code = 106;          -- זיהוי מגמה

  -- Candle patterns
  UPDATE "Lesson" SET unlocksdictionary = '{hammer,inverted-hammer}'
    WHERE unitid = technical_unit AND code = 201;          -- פטיש, פטיש הפוך
  UPDATE "Lesson" SET unlocksdictionary = '{shooting-star,hanging-man}'
    WHERE unitid = technical_unit AND code = 203;          -- כוכב נופל, איש תלוי
  UPDATE "Lesson" SET unlocksdictionary = '{gravestone-doji,dragonfly-doji}'
    WHERE unitid = technical_unit AND code = 205;          -- מצבה שפירית
  UPDATE "Lesson" SET unlocksdictionary = '{doji,regular-doji,long-legged-doji}'
    WHERE unitid = technical_unit AND code = 207;          -- דוג׳י
  UPDATE "Lesson" SET unlocksdictionary = '{bullish-engulfing,bearish-engulfing}'
    WHERE unitid = technical_unit AND code = 209;          -- בליעה שורית, בליעה דובית
  UPDATE "Lesson" SET unlocksdictionary = '{three-inside-up,three-inside-down}'
    WHERE unitid = technical_unit AND code = 211;          -- טריי אינסייד אפ/דאון
  UPDATE "Lesson" SET unlocksdictionary = '{morning-star,evening-star}'
    WHERE unitid = technical_unit AND code = 213;          -- כוכב בוקר, כוכב ערב

  -- Support & resistance
  UPDATE "Lesson" SET unlocksdictionary = '{resistance}'
    WHERE unitid = technical_unit AND code = 301;          -- התנגדות ותקרה
  UPDATE "Lesson" SET unlocksdictionary = '{support}'
    WHERE unitid = technical_unit AND code = 303;          -- תמיכה ורצפה
  UPDATE "Lesson" SET unlocksdictionary = '{breakout}'
    WHERE unitid = technical_unit AND code = 305;          -- פריצות
  UPDATE "Lesson" SET unlocksdictionary = '{retest}'
    WHERE unitid = technical_unit AND code = 308;          -- שיעור Retest

  -- Graphs / price action (basics unit)
  UPDATE "Lesson" SET unlocksdictionary = '{price-movement}'
    WHERE unitid = basics_unit AND code = 401;             -- תנועת המחיר
  UPDATE "Lesson" SET unlocksdictionary = '{line-chart}'
    WHERE unitid = basics_unit AND code = 403;             -- ללמוד לקרוא גרף קווי
  UPDATE "Lesson" SET unlocksdictionary = '{liquidity}'
    WHERE unitid = basics_unit AND code = 404;             -- נזילות
END $$;

-- Verify
-- SELECT code, title, unlocksdictionary FROM "Lesson"
--   WHERE array_length(unlocksdictionary, 1) > 0 ORDER BY code;
