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
            id: 101,
            title: "מבוא לניתוח טכני",
            description: "מושגים, גרפים, ולמה ניתוח טכני חשוב",
            lessonType: "info",
          },
        
          { id: 102, title: "TestLesson", description: "", lessonType: "info" },],
      },
      // 2) דפוסי נרות מתקדמים
      {
        id: 11,
        title: "דפוסי נרות מתקדמים",
        description: "זיהוי ותרגול דפוסי נרות מתקדמים",
        lessonType: "info",
        unlockRequirements: {},
        sublessons: [
          { id: 301, title: "נר שפירית (Dragonfly)", description: "", lessonType: "info" },
          { id: 302, title: "דוג'י (Doji)", description: "", lessonType: "info" },
          { id: 303, title: "בליעת שורית (Bullish Engulfing)", description: "", lessonType: "memorize" },
          { id: 304, title: "בליעת דובית (Bearish Engulfing)", description: "", lessonType: "memorize" },
          { id: 305, title: "הרמי שורית (Bullish Harami)", description: "", lessonType: "memorize" },
          { id: 306, title: "הרמי דובית (Bearish Harami)", description: "", lessonType: "memorize" },
          { id: 307, title: "שלושה בפנים למעלה (Three Inside Up)", description: "", lessonType: "practice" },
          { id: 308, title: "שלושה בפנים למטה (Three Inside Down)", description: "", lessonType: "practice" },
          { id: 309, title: "כוכב נופל — יום", description: "", lessonType: "test" },
          { id: 310, title: "כוכב נופל — ערב", description: "", lessonType: "test" },
        ],
      },
      // 3) הבנת נרות יפניים
      {
        id: 12,
        title: "הבנת נרות יפניים",
        description: "מסגרות זמן, קריאת נרות, היסטוריה ומגמות",
        lessonType: "info",
        unlockRequirements: {},
        sublessons: [
          { id: 201, title: "מסגרות זמן של נרות", description: "איך מסגרת הזמן משפיעה על משמעות הנר", lessonType: "info" },
          { id: 202, title: "איך לקרוא נרות", description: "פתיחה, שיא, שפל, סגירה, גוף ופתילים", lessonType: "info" },
          { id: 203, title: "איך לקרוא נרות — תרגול", description: "תרגול אינטראקטיבי בזיהוי נרות", lessonType: "practice" },
          { id: 204, title: "הסיפור של הנרות היפניים", description: "ההיסטוריה של גרפי הנרות", lessonType: "info" },
          { id: 205, title: "הבנת מגמות", description: "מגמת עליה, מגמת ירידה והתכנסות", lessonType: "info" },
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
          { id: 401, title: "התנגדות (תקרה)", description: "זיהוי אזורי התנגדות", lessonType: "info" },
          { id: 402, title: "תמיכה (רצפה)", description: "זיהוי אזורי תמיכה", lessonType: "info" },
          { id: 403, title: "פריצות", description: "פריצות, בדיקות חוזרות ופריצות שווא", lessonType: "practice" },
          { id: 404, title: "שילוב נרות עם תמיכה/התנגדות", description: "קונפלואנס בין נרות לאזורי תמיכה/התנגדות", lessonType: "memorize" },
        ],
      },

      {
        id: 50,
        title: "New Lesson 5",
        description: "",
        lessonType: "info",
        unlockRequirements: {},
        sublessons: [
          { id: 501, title: "Demo 501", description: "", lessonType: "info" },
        ],
      },
],
  },
  {
    step: 2,
    lessons: [
      {
        id: 5,
        title: "מבוא להשקעות במניות",
        description: "הכרות עם עולם ההשקעות והמניות - הבסיס לכל המשך הלמידה",
        lessonType: "info",
        unlockRequirements: {},
      },
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
    ],
  },
  {
    step: 3,
    lessons: [
      {
        id: 301,
        title: "השקעות לטווח ארוך",
        description: "עקרונות, פיזור וסבלנות",
        lessonType: "info",
        unlockRequirements: {
          completedLessons: [6, 7, 8, 9],
        },
        sublessons: [
          {
            id: 311,
            title: "למה לטווח ארוך?",
            description: "סטטיסטיקה וסיכוי לנצח את התנודתיות",
            lessonType: "info",
          },
          {
            id: 312,
            title: "פיזור וניהול סיכונים",
            description: "סקטורים, מדדים ו-ETF",
            lessonType: "memorize",
          },
          {
            id: 313,
            title: "אסטרטגיות DCA",
            description: "השקעה תקופתית קבועה",
            lessonType: "practice",
          },
          {
            id: 314,
            title: "בדיקת הבנה",
            description: "שאלון קצר על עקרונות השקעה",
            lessonType: "test",
          },
        ],
      },
    ],
  },
  {
    step: 4,
    lessons: [
      {
        id: 4010,
        title: "ניתוח פונדמנטלי",
        description: "קריאת דוחות, מכפילים ויתרון תחרותי",
        lessonType: "info",
        unlockRequirements: {
          completedLessons: [301],
        },
        sublessons: [
          {
            id: 421,
            title: 'דו"חות כספיים בסיס',
            description: "מאזן, רווח והפסד ותזרים",
            lessonType: "info",
          },
          {
            id: 422,
            title: "מכפילים ושווי",
            description: "P/E, EV/EBITDA, מכפיל מכירות",
            lessonType: "memorize",
          },
          {
            id: 423,
            title: "חפיר כלכלי",
            description: "יתרון תחרותי ואיכות הנהלה",
            lessonType: "info",
          },
          {
            id: 424,
            title: "מיני-ניתוח חברה",
            description: "תרגול קצר על חברה לדוגמה",
            lessonType: "practice",
          },
          {
            id: 425,
            title: "מבחן פונדמנטלי",
            description: "בדיקת ידע מסכמת",
            lessonType: "test",
          },
        ],
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
