import React from 'react';
import {
  DragonflyDoji,
  Hammer,
  LongLeggedDoji,
  GravestoneDoji,
  InvertedHammer,
  Doji,
  BullishEngulfing,
  BearishEngulfing,
  ShootingStar,
  RegularDoji,
  CandleStructure,
  ThreeInsideUp,
  ThreeInsideDown,
  MorningStar,
  EveningStar,
} from '../assets/Candels';
import {
  Trend,
  PriceMovement,
  LineChart,
  Liquidity,
  Resistance,
  Support,
  Breakout,
  Retest,
  RSI,
  Index,
  BullMarket,
  BearMarket,
  Stock,
  StockExchange,
} from '../assets/Glossary';

export interface DictionaryTopic {
  id: string;
  title: string;
  icon?: React.ComponentType<any>;
}

export type EntryDirection = 'bullish' | 'bearish' | 'neutral';
export type EntryReliability = 'high' | 'medium' | 'low';
export type EntryFrequency = 'common' | 'rare';

export interface DictionaryEntry {
  id: string;
  term: string;
  explanation: string;
  topicId: string;
  imageComponent?: React.ComponentType<any>;
  imageUrl?: string;
  // Lesson code that unlocks this entry by default (null = always unlocked).
  // The authoritative source at runtime is the unlock map fetched from the
  // backend (Lesson.unlocksdictionary); this is the offline fallback.
  unlockedByLesson?: number | null;
  // Optional educational metadata shown in the detail view.
  direction?: EntryDirection;
  reliability?: EntryReliability;
  frequency?: EntryFrequency;
  appearsIn?: string;
}

/** entryId -> lesson codes that unlock it (from backend). */
export type DictionaryUnlockMap = Record<string, number[]>;

export const DICTIONARY_TOPICS: DictionaryTopic[] = [
  { id: 'all', title: 'הכל' },
  { id: 'candles', title: 'נרות' },
  { id: 'graphs', title: 'גרפים' },
  { id: 'support-resistance', title: 'תמיכה והתנגדות' },
  { id: 'indicators', title: 'מדדים' },
  { id: 'markets', title: 'שווקים' },
];

export const DICTIONARY_ENTRIES: DictionaryEntry[] = [
  // ----- Candles -----
  {
    id: 'candle-structure',
    term: 'מבנה הנר',
    explanation:
      'כל נר יפני מורכב מגוף (הטווח בין מחיר הפתיחה לסגירה) ומפתילים (הצללים) שמראים את המחיר הגבוה והנמוך ביותר. צבע הגוף מציין אם הנר עלה (ירוק) או ירד (אדום).',
    topicId: 'candles',
    imageComponent: CandleStructure,
    unlockedByLesson: 103,
  },
  {
    id: 'hammer',
    term: 'פטיש',
    explanation:
      'נר פטיש מאופיין בגוף קטן בחלק העליון ובפתיל תחתון ארוך (לפחות פי 2 מהגוף). הוא מופיע אחרי מגמת ירידה ומסמן לרוב היפוך כלפי מעלה.',
    topicId: 'candles',
    imageComponent: Hammer,
    unlockedByLesson: 201,
    direction: 'bullish',
    reliability: 'medium',
    frequency: 'common',
    appearsIn: 'מגמת ירידה',
  },
  {
    id: 'inverted-hammer',
    term: 'פטיש הפוך',
    explanation:
      'נר פטיש הפוך מאופיין בגוף קטן בחלק התחתון ובפתיל עליון ארוך. הוא מופיע אחרי מגמת ירידה ועשוי לסמן תחילת היפוך כלפי מעלה.',
    topicId: 'candles',
    imageComponent: InvertedHammer,
    unlockedByLesson: 201,
    direction: 'bullish',
    reliability: 'medium',
    frequency: 'common',
    appearsIn: 'מגמת ירידה',
  },
  {
    id: 'shooting-star',
    term: 'כוכב נופל',
    explanation:
      'נר כוכב נופל מאופיין בגוף קטן בתחתית ובפתיל עליון ארוך, ומופיע בסוף מגמת עלייה. הוא מסמן לחץ מכירה ואפשרות להיפוך כלפי מטה.',
    topicId: 'candles',
    imageComponent: ShootingStar,
    unlockedByLesson: 203,
    direction: 'bearish',
    reliability: 'high',
    frequency: 'common',
    appearsIn: 'מגמת עלייה',
  },
  {
    id: 'hanging-man',
    term: 'איש תלוי',
    explanation:
      'נר איש תלוי נראה כמו פטיש (גוף קטן למעלה, פתיל תחתון ארוך) אך מופיע בסוף מגמת עלייה. הוא מהווה אזהרה להיפוך אפשרי כלפי מטה.',
    topicId: 'candles',
    imageComponent: Hammer,
    unlockedByLesson: 203,
    direction: 'bearish',
    reliability: 'medium',
    frequency: 'common',
    appearsIn: 'מגמת עלייה',
  },
  {
    id: 'gravestone-doji',
    term: "דוג'י מצבה",
    explanation:
      "דוג'י מצבה הוא נר עם גוף זעיר בתחתית ופתיל עליון ארוך, כמעט ללא פתיל תחתון. הוא מצביע על דחיית מחירים גבוהים ועל לחץ מכירה.",
    topicId: 'candles',
    imageComponent: GravestoneDoji,
    unlockedByLesson: 205,
    direction: 'bearish',
    reliability: 'high',
    frequency: 'rare',
    appearsIn: 'מגמת עלייה',
  },
  {
    id: 'dragonfly-doji',
    term: "דוג'י שפירית",
    explanation:
      "דוג'י שפירית הוא נר עם גוף זעיר בחלק העליון ופתיל תחתון ארוך. הוא מצביע על לחץ קנייה ועשוי לסמן היפוך כלפי מעלה אחרי ירידה.",
    topicId: 'candles',
    imageComponent: DragonflyDoji,
    unlockedByLesson: 205,
    direction: 'bullish',
    reliability: 'high',
    frequency: 'rare',
    appearsIn: 'מגמת ירידה',
  },
  {
    id: 'doji',
    term: "דוג'י",
    explanation:
      "נר דוג'י נוצר כאשר מחיר הפתיחה והסגירה כמעט זהים, כך שהגוף זעיר. הוא משקף חוסר החלטיות בשוק ואיזון בין קונים למוכרים.",
    topicId: 'candles',
    imageComponent: Doji,
    unlockedByLesson: 207,
    direction: 'neutral',
    reliability: 'medium',
    frequency: 'common',
  },
  {
    id: 'regular-doji',
    term: "דוג'י רגיל",
    explanation:
      "דוג'י רגיל הוא הצורה הבסיסית של דוג'י, עם פתילים קצרים יחסית מעל ומתחת לגוף הזעיר. הוא מבטא היסוס בשוק.",
    topicId: 'candles',
    imageComponent: RegularDoji,
    unlockedByLesson: 207,
    direction: 'neutral',
    reliability: 'medium',
    frequency: 'common',
  },
  {
    id: 'long-legged-doji',
    term: "דוג'י רגליים ארוכות",
    explanation:
      "דוג'י רגליים ארוכות הוא נר עם גוף זעיר במרכז ופתילים ארוכים מאוד למעלה ולמטה. הוא מבטא תנודתיות גבוהה וחוסר החלטיות חזק.",
    topicId: 'candles',
    imageComponent: LongLeggedDoji,
    unlockedByLesson: 207,
    direction: 'neutral',
    reliability: 'low',
    frequency: 'rare',
  },
  {
    id: 'bullish-engulfing',
    term: 'בליעה שורית',
    explanation:
      "תבנית בליעה שורית מורכבת משני נרות: נר ירוק גדול ש'בולע' לחלוטין נר אדום קטן שלפניו. היא מסמנת מעבר לשליטת הקונים והיפוך כלפי מעלה.",
    topicId: 'candles',
    imageComponent: BullishEngulfing,
    unlockedByLesson: 209,
    direction: 'bullish',
    reliability: 'high',
    frequency: 'common',
    appearsIn: 'מגמת ירידה',
  },
  {
    id: 'bearish-engulfing',
    term: 'בליעה דובית',
    explanation:
      "תבנית בליעה דובית מורכבת מנר אדום גדול ש'בולע' נר ירוק קטן שלפניו. היא מסמנת מעבר לשליטת המוכרים והיפוך כלפי מטה.",
    topicId: 'candles',
    imageComponent: BearishEngulfing,
    unlockedByLesson: 209,
    direction: 'bearish',
    reliability: 'high',
    frequency: 'common',
    appearsIn: 'מגמת עלייה',
  },
  {
    id: 'three-inside-up',
    term: 'טריי אינסייד אפ',
    explanation:
      'תבנית היפוך עולה בת שלושה נרות: נר יורד גדול, נר עולה קטן בתוכו, ונר עולה שלישי שמאשר את ההיפוך כלפי מעלה.',
    topicId: 'candles',
    imageComponent: ThreeInsideUp,
    unlockedByLesson: 211,
    direction: 'bullish',
    reliability: 'medium',
    frequency: 'rare',
    appearsIn: 'מגמת ירידה',
  },
  {
    id: 'three-inside-down',
    term: 'טריי אינסייד דאון',
    explanation:
      'תבנית היפוך יורד בת שלושה נרות: נר עולה גדול, נר יורד קטן בתוכו, ונר יורד שלישי שמאשר את ההיפוך כלפי מטה.',
    topicId: 'candles',
    imageComponent: ThreeInsideDown,
    unlockedByLesson: 211,
    direction: 'bearish',
    reliability: 'medium',
    frequency: 'rare',
    appearsIn: 'מגמת עלייה',
  },
  {
    id: 'morning-star',
    term: 'כוכב בוקר',
    explanation:
      'כוכב בוקר היא תבנית היפוך עולה בת שלושה נרות שמופיעה בתחתית מגמת ירידה: נר יורד, נר קטן (הכוכב), ונר עולה חזק שמאשר את ההיפוך.',
    topicId: 'candles',
    imageComponent: MorningStar,
    unlockedByLesson: 213,
    direction: 'bullish',
    reliability: 'high',
    frequency: 'rare',
    appearsIn: 'מגמת ירידה',
  },
  {
    id: 'evening-star',
    term: 'כוכב ערב',
    explanation:
      'כוכב ערב היא תבנית היפוך יורד בת שלושה נרות שמופיעה בשיא מגמת עלייה: נר עולה, נר קטן (הכוכב), ונר יורד חזק שמאשר את ההיפוך.',
    topicId: 'candles',
    imageComponent: EveningStar,
    unlockedByLesson: 213,
    direction: 'bearish',
    reliability: 'high',
    frequency: 'rare',
    appearsIn: 'מגמת עלייה',
  },

  // ----- Graphs / price action -----
  {
    id: 'trend',
    term: 'מגמה',
    explanation:
      'מגמה היא הכיוון הכללי של המחיר לאורך זמן: מגמת עלייה (שיאים ושפלים עולים), מגמת ירידה (שיאים ושפלים יורדים), או מגמה צידית (דשדוש).',
    topicId: 'graphs',
    imageComponent: Trend,
    unlockedByLesson: 106,
    direction: 'bullish',
    frequency: 'common',
  },
  {
    id: 'price-movement',
    term: 'תנועת מחיר',
    explanation:
      'תנועת מחיר מתארת כיצד המחיר נע לאורך זמן בין קונים למוכרים, ויוצרת שיאים ושפלים שמהם מזהים מגמות, רמות ותבניות.',
    topicId: 'graphs',
    imageComponent: PriceMovement,
    unlockedByLesson: 401,
    direction: 'neutral',
    frequency: 'common',
  },
  {
    id: 'line-chart',
    term: 'גרף קווי',
    explanation:
      'גרף קווי מחבר את מחירי הסגירה לאורך זמן בקו אחד רציף. הוא פשוט לקריאה ומתאים לזיהוי מגמה כללית, אך אינו מציג את טווח המסחר המלא.',
    topicId: 'graphs',
    imageComponent: LineChart,
    unlockedByLesson: 403,
    direction: 'neutral',
    frequency: 'common',
  },
  {
    id: 'liquidity',
    term: 'נזילות',
    explanation:
      'נזילות היא המידה שבה ניתן לקנות או למכור נכס במהירות ובלי להשפיע משמעותית על מחירו. נכס נזיל מתאפיין במחזור מסחר גבוה ובמרווחים צרים.',
    topicId: 'graphs',
    imageComponent: Liquidity,
    unlockedByLesson: 404,
    direction: 'neutral',
    frequency: 'common',
  },

  // ----- Support & resistance -----
  {
    id: 'resistance',
    term: 'התנגדות',
    explanation:
      'רמת התנגדות (תקרה) היא אזור מחיר שבו לחץ המכירה גובר ועוצר עליות. ככל שהמחיר נכשל לפרוץ אותה יותר פעמים, הרמה נחשבת חזקה יותר.',
    topicId: 'support-resistance',
    imageComponent: Resistance,
    unlockedByLesson: 301,
    direction: 'bearish',
    reliability: 'high',
    frequency: 'common',
  },
  {
    id: 'support',
    term: 'תמיכה',
    explanation:
      'רמת תמיכה (רצפה) היא אזור מחיר שבו לחץ הקנייה גובר ועוצר ירידות. רמה זו משמשת לעיתים כנקודת כניסה פוטנציאלית.',
    topicId: 'support-resistance',
    imageComponent: Support,
    unlockedByLesson: 303,
    direction: 'bullish',
    reliability: 'high',
    frequency: 'common',
  },
  {
    id: 'breakout',
    term: 'פריצה',
    explanation:
      'פריצה היא מצב שבו המחיר חוצה בבירור רמת תמיכה או התנגדות משמעותית, ולרוב מסמנת תחילת תנועה חזקה בכיוון הפריצה.',
    topicId: 'support-resistance',
    imageComponent: Breakout,
    unlockedByLesson: 305,
    direction: 'bullish',
    reliability: 'medium',
    frequency: 'common',
  },
  {
    id: 'retest',
    term: 'ריטסט',
    explanation:
      'ריטסט הוא חזרה של המחיר לבדוק רמת תמיכה/התנגדות שנפרצה, כדי לוודא שהיא הפכה תפקיד (תמיכה שהפכה להתנגדות ולהפך) לפני המשך התנועה.',
    topicId: 'support-resistance',
    imageComponent: Retest,
    unlockedByLesson: 308,
    direction: 'bullish',
    reliability: 'medium',
    frequency: 'common',
  },

  // ----- Indicators (always available) -----
  {
    id: 'rsi',
    term: 'מדד RSI',
    explanation:
      'מדד RSI מודד את עוצמת התנועה של המחיר בסקאלה של 0 עד 100. ערך מעל 70 נחשב קניית-יתר ומתחת ל-30 מכירת-יתר, מצבים שעשויים לרמז על היפוך.',
    topicId: 'indicators',
    imageComponent: RSI,
    unlockedByLesson: null,
    direction: 'neutral',
    frequency: 'common',
  },
  {
    id: 'index',
    term: 'מדד',
    explanation:
      'מדד הוא מדידה משוקללת של קבוצת נכסים (כמו ת"א 35 או S&P 500), המשמשת לעקוב אחר ביצועי השוק או ענף שלם.',
    topicId: 'indicators',
    imageComponent: Index,
    unlockedByLesson: null,
    direction: 'neutral',
    frequency: 'common',
  },

  // ----- Markets (always available) -----
  {
    id: 'bull-market',
    term: 'שוק שורי',
    explanation:
      'שוק שורי הוא תקופה שבה המחירים נמצאים במגמת עלייה מתמשכת, מלווה באופטימיות של המשקיעים ובביקוש גובר.',
    topicId: 'markets',
    imageComponent: BullMarket,
    unlockedByLesson: null,
    direction: 'bullish',
    frequency: 'common',
  },
  {
    id: 'bear-market',
    term: 'שוק דובי',
    explanation:
      'שוק דובי הוא תקופה שבה המחירים נמצאים במגמת ירידה מתמשכת, מלווה בפסימיות ובלחץ מכירות.',
    topicId: 'markets',
    imageComponent: BearMarket,
    unlockedByLesson: null,
    direction: 'bearish',
    frequency: 'common',
  },
  {
    id: 'stock',
    term: 'מניה',
    explanation:
      'מניה היא יחידת בעלות בחברה. רכישת מניה הופכת אותך לשותף קטן בחברה ומקנה זכות לחלק מרווחיה ומערכה.',
    topicId: 'markets',
    imageComponent: Stock,
    unlockedByLesson: null,
    direction: 'neutral',
    frequency: 'common',
  },
  {
    id: 'stock-exchange',
    term: 'בורסה',
    explanation:
      'בורסה היא שוק מאורגן שבו נסחרים ניירות ערך כמו מניות ואיגרות חוב, ומאפשרת לקונים ולמוכרים לסחור במחירים שקופים.',
    topicId: 'markets',
    imageComponent: StockExchange,
    unlockedByLesson: null,
    direction: 'neutral',
    frequency: 'common',
  },
];

/**
 * Resolve the lesson codes that unlock a given entry. Prefers the backend
 * unlock map; falls back to the static `unlockedByLesson` value.
 */
function resolveUnlockCodes(
  entry: DictionaryEntry,
  unlockMap?: DictionaryUnlockMap,
): number[] {
  const fromMap = unlockMap?.[entry.id];
  if (fromMap && fromMap.length > 0) return fromMap;
  if (entry.unlockedByLesson === null || entry.unlockedByLesson === undefined) {
    return [];
  }
  return [entry.unlockedByLesson];
}

// Check if an entry is unlocked for a user.
// An entry with no unlocking lessons is always unlocked.
export function isEntryUnlocked(
  entry: DictionaryEntry,
  completedLessons: number[],
  unlockMap?: DictionaryUnlockMap,
): boolean {
  const codes = resolveUnlockCodes(entry, unlockMap);
  if (codes.length === 0) return true;
  return codes.some((code) => completedLessons.includes(code));
}

export function getEntriesByTopic(topicId: string | null): DictionaryEntry[] {
  if (!topicId || topicId === 'all') {
    return DICTIONARY_ENTRIES;
  }
  return DICTIONARY_ENTRIES.filter(entry => entry.topicId === topicId);
}

export function getEntryById(entryId: string): DictionaryEntry | undefined {
  return DICTIONARY_ENTRIES.find(entry => entry.id === entryId);
}

/** Maps lesson codes (from DB) to dictionary entries for "שמור במילון" actions. */
export const LESSON_DICTIONARY_LINKS: Record<
  number,
  { topicId: string; termId: string }
> = {
  201: { topicId: 'candles', termId: 'hammer' },
  203: { topicId: 'candles', termId: 'shooting-star' },
  205: { topicId: 'candles', termId: 'dragonfly-doji' },
  207: { topicId: 'candles', termId: 'doji' },
  209: { topicId: 'candles', termId: 'bullish-engulfing' },
  211: { topicId: 'candles', termId: 'three-inside-up' },
  213: { topicId: 'candles', termId: 'morning-star' },
  301: { topicId: 'support-resistance', termId: 'resistance' },
  303: { topicId: 'support-resistance', termId: 'support' },
  305: { topicId: 'support-resistance', termId: 'breakout' },
};

/** Maps lesson step visual keys to dictionary entries (works with DB lesson JSON). */
export const VISUAL_DICTIONARY_LINKS: Record<
  string,
  { topicId: string; termId: string }
> = {
  dragonflyCandle: { topicId: 'candles', termId: 'dragonfly-doji' },
  dragonflyTrend: { topicId: 'candles', termId: 'dragonfly-doji' },
  dragonflyReversal: { topicId: 'candles', termId: 'dragonfly-doji' },
  dojiSummary: { topicId: 'candles', termId: 'doji' },
  hammerCandle: { topicId: 'candles', termId: 'hammer' },
  invertedHammerCandle: { topicId: 'candles', termId: 'inverted-hammer' },
};

export function getDictionaryLinkForChoice(
  choice: {
    text?: string;
    dictionaryTopicId?: string;
    dictionaryTermId?: string;
  },
  lessonId: number,
  stepVisual?: string,
): { topicId: string; termId: string } | null {
  if (choice.dictionaryTopicId && choice.dictionaryTermId) {
    return {
      topicId: choice.dictionaryTopicId,
      termId: choice.dictionaryTermId,
    };
  }

  const isDictionaryAction =
    choice.text?.includes('מילון') || choice.text === 'שמור במילון';
  if (!isDictionaryAction) return null;

  if (stepVisual && VISUAL_DICTIONARY_LINKS[stepVisual]) {
    return VISUAL_DICTIONARY_LINKS[stepVisual];
  }

  return LESSON_DICTIONARY_LINKS[lessonId] ?? null;
}

export function filterEntries(
  query: string,
  topicId: string,
  completedLessons: number[],
  unlockMap?: DictionaryUnlockMap,
): DictionaryEntry[] {
  const normalizedQuery = query.trim().toLowerCase();
  let entries = getEntriesByTopic(topicId === 'all' ? null : topicId);

  if (normalizedQuery) {
    entries = entries.filter(
      (entry) =>
        entry.term.toLowerCase().includes(normalizedQuery) ||
        entry.explanation.toLowerCase().includes(normalizedQuery),
    );
  }

  return [...entries].sort((a, b) => {
    const aUnlocked = isEntryUnlocked(a, completedLessons, unlockMap);
    const bUnlocked = isEntryUnlocked(b, completedLessons, unlockMap);
    if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
    return a.term.localeCompare(b.term, 'he');
  });
}
