import { LessonMetadata } from "./types";

export const lessonsRegistry: LessonMetadata[] = [
  {
    id: 1,
    title: "מבוא לשוק ההון",
    description: "למד את היסודות של שוק ההון והמושגים הבסיסיים",
    unlockRequirements: {}, // First lesson is always unlocked
  },
  {
    id: 2,
    title: "מהי מניה?",
    description: "הבנת המושג מניה וכיצד היא עובדת",
    unlockRequirements: {
      completedLessons: [1],
    },
  },
  {
    id: 3,
    title: "איך קונים מניה?",
    description: "צעדים מעשיים לרכישת המניה הראשונה שלך",
    unlockRequirements: {
      completedLessons: [1, 2],
    },
  },
  {
    id: 4,
    title: "סיכונים והזדמנויות",
    description: "הבנת הסיכונים וההזדמנויות בהשקעה במניות",
    unlockRequirements: {
      completedLessons: [1, 2, 3],
    },
  },
];

export function getLessonMetadata(id: number): LessonMetadata | undefined {
  return lessonsRegistry.find((lesson) => lesson.id === id);
}

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
