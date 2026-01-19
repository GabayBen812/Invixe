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
} from '../assets/Candels';

export interface DictionaryTopic {
  id: string;
  title: string;
  icon?: React.ComponentType<any>;
}

export interface DictionaryEntry {
  id: string;
  term: string;
  explanation: string;
  topicId: string;
  imageComponent?: React.ComponentType<any>;
  imageUrl?: string;
  seen?: boolean;
  mastered?: boolean;
  // Lesson ID that unlocks this entry (null = unlocked by default)
  unlockedByLesson?: number | null;
}

export const DICTIONARY_TOPICS: DictionaryTopic[] = [
  { id: 'all', title: 'הכל' },
  { id: 'candles', title: 'נרות' },
  { id: 'graphs', title: 'גרפים' },
  { id: 'indicators', title: 'מדדים' },
  { id: 'markets', title: 'שוקים' },
];

export const DICTIONARY_ENTRIES: DictionaryEntry[] = [
  // Candles topic - unlocked by specific lessons
  {
    id: 'hammer',
    term: 'פטיש',
    explanation: 'נר פטיש הוא דפוס נר המשמש לזיהוי שינוי מגמה. הוא מופיע בדרך כלל לאחר עלייה משמעותית ולפני ירידה חזקה. הנר מאופיין בגוף קטן בתחתית ופתיל עליון ארוך.',
    topicId: 'candles',
    imageComponent: Hammer,
    unlockedByLesson: 2, // Example: unlocked by lesson 2 (נרות פטיש)
  },
  {
    id: 'inverted-hammer',
    term: 'פטיש הפוך',
    explanation: 'נר פטיש הפוך הוא דפוס נר המשמש לזיהוי שינוי מגמה. הוא מופיע בדרך כלל לאחר עלייה משמעותית ולפני ירידה חזקה. הנר מאופיין בגוף קטן בתחתית ופתיל עליון ארוך.',
    topicId: 'candles',
    imageComponent: InvertedHammer,
    unlockedByLesson: 2,
  },
  {
    id: 'doji',
    term: 'דוג\'י',
    explanation: 'נר דוג\'י הוא דפוס נר המאופיין בגוף קטן מאוד, מה שמצביע על אי-ודאות בשוק. הוא מופיע כאשר מחיר הפתיחה והסגירה קרובים מאוד זה לזה.',
    topicId: 'candles',
    imageComponent: Doji,
    unlockedByLesson: 3,
  },
  {
    id: 'dragonfly-doji',
    term: 'דוג\'י שפירית',
    explanation: 'נר דוג\'י שפירית הוא דפוס נר המאופיין בגוף קטן בתחתית ופתיל תחתון ארוך. הוא מצביע על לחץ קנייה חזק ועלול לסמן שינוי מגמה.',
    topicId: 'candles',
    imageComponent: DragonflyDoji,
    unlockedByLesson: 3,
  },
  {
    id: 'gravestone-doji',
    term: 'דוג\'י מצבה',
    explanation: 'נר דוג\'י מצבה הוא דפוס נר המאופיין בגוף קטן בחלק העליון ופתיל עליון ארוך. הוא מצביע על לחץ מכירה חזק ועלול לסמן שינוי מגמה.',
    topicId: 'candles',
    imageComponent: GravestoneDoji,
    unlockedByLesson: 3,
  },
  {
    id: 'long-legged-doji',
    term: 'דוג\'י רגליים ארוכות',
    explanation: 'נר דוג\'י רגליים ארוכות הוא דפוס נר המאופיין בגוף קטן במרכז ופתילים ארוכים למעלה ולמטה. הוא מצביע על אי-ודאות גבוהה בשוק.',
    topicId: 'candles',
    imageComponent: LongLeggedDoji,
    unlockedByLesson: 4,
  },
  {
    id: 'bullish-engulfing',
    term: 'עוטף עלייה',
    explanation: 'נר עוטף עלייה הוא דפוס נר המשמש לזיהוי שינוי מגמה. הוא מופיע כאשר נר ירוק גדול "עוטף" נר אדום קטן, מה שמצביע על לחץ קנייה חזק.',
    topicId: 'candles',
    imageComponent: BullishEngulfing,
    unlockedByLesson: 5,
  },
  {
    id: 'bearish-engulfing',
    term: 'עוטף ירידה',
    explanation: 'נר עוטף ירידה הוא דפוס נר המשמש לזיהוי שינוי מגמה. הוא מופיע כאשר נר אדום גדול "עוטף" נר ירוק קטן, מה שמצביע על לחץ מכירה חזק.',
    topicId: 'candles',
    imageComponent: BearishEngulfing,
    unlockedByLesson: 5,
  },
  {
    id: 'shooting-star',
    term: 'כוכב נופל',
    explanation: 'נר כוכב נופל הוא דפוס נר המשמש לזיהוי שינוי מגמה. הוא מופיע בדרך כלל לאחר עלייה משמעותית ולפני ירידה חזקה. הנר מאופיין בגוף קטן בחלק העליון ופתיל עליון ארוך.',
    topicId: 'candles',
    imageComponent: ShootingStar,
    unlockedByLesson: 6,
  },
  {
    id: 'regular-doji',
    term: 'דוג\'י רגיל',
    explanation: 'נר דוג\'י רגיל הוא דפוס נר המאופיין בגוף קטן מאוד, מה שמצביע על אי-ודאות בשוק. הוא מופיע כאשר מחיר הפתיחה והסגירה קרובים מאוד זה לזה.',
    topicId: 'candles',
    imageComponent: RegularDoji,
    unlockedByLesson: 3,
  },
  // Add more entries for other topics as needed
  {
    id: 'graph-example-1',
    term: 'גרף עלייה',
    explanation: 'גרף עלייה מציג מגמה חיובית במחיר לאורך זמן. הוא מאופיין בסדרה של נקודות או קווים העולים משמאל לימין.',
    topicId: 'graphs',
    unlockedByLesson: 10, // Example: unlocked by graph lessons
  },
  {
    id: 'graph-example-2',
    term: 'גרף ירידה',
    explanation: 'גרף ירידה מציג מגמה שלילית במחיר לאורך זמן. הוא מאופיין בסדרה של נקודות או קווים היורדים משמאל לימין.',
    topicId: 'graphs',
    unlockedByLesson: 10,
  },
  {
    id: 'indicator-example-1',
    term: 'מדד RSI',
    explanation: 'מדד RSI (Relative Strength Index) הוא מדד טכני המשמש למדידת כוח התנועה של המחיר. הוא נע בין 0 ל-100 ומצביע על תנאי קנייה או מכירה יתרה.',
    topicId: 'indicators',
    unlockedByLesson: 20, // Example: unlocked by indicator lessons
  },
  {
    id: 'market-example-1',
    term: 'שוק שורי',
    explanation: 'שוק שורי הוא שוק שבו המחירים עולים לאורך זמן. הוא מאופיין באופטימיות משקיעים וביקוש גבוה לנכסים.',
    topicId: 'markets',
    unlockedByLesson: null, // Unlocked by default
  },
];

// Helper function to check if an entry is unlocked for a user
export function isEntryUnlocked(
  entry: DictionaryEntry,
  completedLessons: number[]
): boolean {
  // If no lesson requirement, it's unlocked by default
  if (entry.unlockedByLesson === null || entry.unlockedByLesson === undefined) {
    return true;
  }
  // Check if the user has completed the required lesson
  return completedLessons.includes(entry.unlockedByLesson);
}

// Helper function to get entries by topic
export function getEntriesByTopic(topicId: string | null): DictionaryEntry[] {
  if (!topicId || topicId === 'all') {
    return DICTIONARY_ENTRIES;
  }
  return DICTIONARY_ENTRIES.filter(entry => entry.topicId === topicId);
}

// Helper function to calculate progress for a topic
export function calculateTopicProgress(
  topicId: string | null,
  progressMap: Record<string, { seen: boolean; mastered: boolean }>
): number {
  const entries = getEntriesByTopic(topicId);
  if (entries.length === 0) return 0;
  
  const seenCount = entries.filter(entry => progressMap[entry.id]?.seen).length;
  return Math.round((seenCount / entries.length) * 100);
}

// Helper function to get entry by ID
export function getEntryById(entryId: string): DictionaryEntry | undefined {
  return DICTIONARY_ENTRIES.find(entry => entry.id === entryId);
}
