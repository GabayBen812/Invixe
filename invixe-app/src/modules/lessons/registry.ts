import { LessonMetadata } from "./types";

export interface StepRegistry {
  step: number;
  lessons: LessonMetadata[];
}

export const lessonsRegistry: StepRegistry[] = [
  {
    step: 1,
    lessons: [
      {
        id: 1,
        title: "מבוא לשוק ההון",
        description: "למד את היסודות של שוק ההון והמושגים הבסיסיים",
        lessonType: "info",
        unlockRequirements: {},
      },
      {
        id: 2,
        title: "קריאת גרפים בסיסית",
        description: "הבנת גרפי מחירים וקווי מגמה",
        lessonType: "info",
        unlockRequirements: {
          completedLessons: [1],
        },
      },
      {
        id: 3,
        title: "תרגול זיהוי מגמות",
        description: "תרגל זיהוי מגמות עולות וירידות בגרפים",
        lessonType: "practice",
        unlockRequirements: {
          completedLessons: [1, 2],
        },
      },
      {
        id: 4,
        title: "נרות יפניים - מבוא",
        description: "למד על נרות יפניים וכיצד לקרוא אותם",
        lessonType: "memorize",
        unlockRequirements: {
          completedLessons: [2],
        },
      },
      {
        id: 5,
        title: "תרגול נרות יפניים",
        description: "תרגל זיהוי דפוסי נרות יפניים",
        lessonType: "practice",
        unlockRequirements: {
          completedLessons: [4],
        },
      },
      {
        id: 101,
        title: "מבחן: ניתוח טכני בסיסי",
        description: "בדוק את הידע שלך בניתוח טכני בסיסי",
        lessonType: "test",
        unlockRequirements: {
          completedLessons: [1, 2, 3, 4, 5],
        },
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
        unlockRequirements: {
          completedLessons: [101],
        },
      },
      {
        id: 7,
        title: "סוגי מניות",
        description: "מניות רגילות, מועדפות ועוד",
        lessonType: "memorize",
        unlockRequirements: {
          completedLessons: [6],
        },
      },
      {
        id: 8,
        title: "בחירת מניות - יסודות",
        description: "איך לבחור מניות טובות להשקעה",
        lessonType: "info",
        unlockRequirements: {
          completedLessons: [6, 7],
        },
      },
      {
        id: 9,
        title: "סימולציית קנייה",
        description: "תרגל קניית מניות במשחק סימולציה",
        lessonType: "practice",
        unlockRequirements: {
          completedLessons: [8],
        },
      },
      {
        id: 102,
        title: "מבחן: מניות ומסחר",
        description: "בדוק את הידע שלך במסחר במניות",
        lessonType: "test",
        unlockRequirements: {
          completedLessons: [6, 7, 8, 9],
        },
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

// Helper to check if a lesson is unlocked
export function isLessonUnlocked(
  lessonId: number,
  completedLessons: number[]
): boolean {
  const lesson = getLessonMetadata(lessonId);
  if (!lesson) return false;

  const requirements = lesson.unlockRequirements;
  if (!requirements) return true;

  if (requirements.completedLessons) {
    return requirements.completedLessons.every((id) =>
      completedLessons.includes(id)
    );
  }

  return true;
}
