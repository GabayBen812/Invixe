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
        id: 101,
        title: "חידון: מבוא לשוק ההון",
        description: "בדוק את הידע שלך על היסודות של שוק ההון.",
        lessonType: "test",
        unlockRequirements: {
          completedLessons: [1],
        },
      },
    ],
  },
  {
    step: 2,
    lessons: [
      {
        id: 2,
        title: "מהי מניה?",
        description: "הבנת המושג מניה וכיצד היא עובדת",
        lessonType: "memorize",
        unlockRequirements: {
          completedLessons: [1],
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
