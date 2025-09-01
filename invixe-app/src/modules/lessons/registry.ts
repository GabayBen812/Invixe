import { LessonMetadata } from "./types";

export interface StepRegistry {
  step: number;
  lessons: LessonMetadata[];
}

export const lessonsRegistry: StepRegistry[] = [
  {
    step: 1,
    lessons: [
      // 1) מהו ניתוח טכני?
      {
        id: 10,
        title: "מהו ניתוח טכני?",
        description: "מבוא לניתוח טכני וכיצד הוא מסייע לסוחרים",
        lessonType: "info",
        unlockRequirements: {},
        sublessons: [
          {
            id: 11,
            title: "מבוא לניתוח טכני",
            description: "מושגים, גרפים, ולמה ניתוח טכני חשוב",
            lessonType: "info",
          },
        ],
      },
      // 2) הבנת נרות יפניים
      {
        id: 12,
        title: "הבנת נרות יפניים",
        description: "מסגרות זמן, קריאת נרות, היסטוריה ומגמות",
        lessonType: "info",
        unlockRequirements: {},
        sublessons: [
          {
            id: 201,
            title: "מסגרות זמן של נרות",
            description: "איך מסגרת הזמן משפיעה על משמעות הנר",
            lessonType: "info",
          },
          {
            id: 202,
            title: "איך לקרוא נרות",
            description: "פתיחה, שיא, שפל, סגירה, גוף ופתילים",
            lessonType: "info",
          },
          {
            id: 203,
            title: "איך לקרוא נרות — תרגול",
            description: "תרגול אינטראקטיבי בזיהוי נרות",
            lessonType: "practice",
          },
          {
            id: 204,
            title: "הסיפור של הנרות היפניים",
            description: "ההיסטוריה של גרפי הנרות",
            lessonType: "info",
          },
          {
            id: 205,
            title: "הבנת מגמות",
            description: "מגמת עליה, מגמת ירידה והתכנסות",
            lessonType: "info",
          },
        ],
      },
      // 3) דפוסי נרות מתקדמים (תוכן קיים)
      {
        id: 1,
        title: "דפוסי נרות מתקדמים",
        description: "זיהוי ותרגול דפוסי נרות מתקדמים",
        lessonType: "info",
        unlockRequirements: {},
        sublessons: [
          { id: 101, title: "נר שפירית (Dragonfly)", description: "", lessonType: "info" },
          { id: 102, title: "דוג'י (Doji)", description: "", lessonType: "info" },
          { id: 103, title: "בליעת שורית (Bullish Engulfing)", description: "", lessonType: "memorize" },
          { id: 104, title: "בליעת דובית (Bearish Engulfing)", description: "", lessonType: "memorize" },
          { id: 105, title: "הרמי שורית (Bullish Harami)", description: "", lessonType: "memorize" },
          { id: 106, title: "הרמי דובית (Bearish Harami)", description: "", lessonType: "memorize" },
          { id: 107, title: "שלושה בפנים למעלה (Three Inside Up)", description: "", lessonType: "practice" },
          { id: 108, title: "שלושה בפנים למטה (Three Inside Down)", description: "", lessonType: "practice" },
          { id: 109, title: "כוכב נופל — יום", description: "", lessonType: "test" },
          { id: 110, title: "כוכב נופל — ערב", description: "", lessonType: "test" },
        ],
      },
      // 4) תמיכה והתנגדות
      {
        id: 13,
        title: "תמיכה והתנגדות",
        description: "רצפה, תקרה, פריצות ושילוב עם דפוסי נרות",
        lessonType: "info",
        unlockRequirements: {},
        sublessons: [
          {
            id: 401,
            title: "התנגדות (תקרה)",
            description: "זיהוי אזורי התנגדות",
            lessonType: "info",
          },
          {
            id: 402,
            title: "תמיכה (רצפה)",
            description: "זיהוי אזורי תמיכה",
            lessonType: "info",
          },
          {
            id: 403,
            title: "פריצות",
            description: "פריצות, בדיקות חוזרות ופריצות שווא",
            lessonType: "practice",
          },
          {
            id: 404,
            title: "שילוב נרות עם תמיכה/התנגדות",
            description: "קונפלואנס בין נרות לאזורי תמיכה/התנגדות",
            lessonType: "memorize",
          },
        ],
      },
    ],
  },
  {
    step: 2,
    lessons: [
      {
        id: 6,
        title: "מהי מניה?",
        description: "הבנת המושג מניה וכיצד היא עובדת",
        lessonType: "info",
        unlockRequirements: {},
      },
      {
        id: 7,
        title: "סוגי מניות",
        description: "מניות רגילות, מועדפות ועוד",
        lessonType: "memorize",
        unlockRequirements: {},
      },
      {
        id: 8,
        title: "בחירת מניות - יסודות",
        description: "איך לבחור מניות טובות להשקעה",
        lessonType: "info",
        unlockRequirements: {},
      },
      {
        id: 9,
        title: "סימולציית קנייה",
        description: "תרגל קניית מניות במשחק סימולציה",
        lessonType: "practice",
        unlockRequirements: {},
      },
      {
        id: 102,
        title: "מבחן: מניות ומסחר",
        description: "בדוק את הידע שלך במסחר במניות",
        lessonType: "test",
        unlockRequirements: {},
      },
    ],
  },
];

// Helper to get lesson metadata by id
export function getLessonMetadata(id: number): LessonMetadata | undefined {
  for (const step of lessonsRegistry) {
    const lesson = step.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

// Given a sublesson id, return its parent lesson metadata if found
export function getParentLessonForSublesson(sublessonId: number): LessonMetadata | undefined {
  for (const step of lessonsRegistry) {
    for (const lesson of step.lessons) {
      if (lesson.sublessons && lesson.sublessons.some((s) => s.id === sublessonId)) {
        return lesson;
      }
    }
  }
  return undefined;
}

// Check if all sublessons of a given lesson are completed
export function areAllSublessonsCompleted(lesson: LessonMetadata, completedLessons: number[]): boolean {
  if (!lesson.sublessons || lesson.sublessons.length === 0) return false;
  return lesson.sublessons.every((s) => completedLessons.includes(s.id));
}

// Helper to check if a lesson is unlocked (all lessons are now unlocked)
export function isLessonUnlocked(
  lessonId: number,
  completedLessons: number[]
): boolean {
  // All lessons are now unlocked - users can choose any course
  return true;
}
