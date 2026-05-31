import { LessonMetadata, StepRegistry } from "./types";
import { areAllSublessonsCompleted } from "./lessonUtils";
import {
  getNextLessonFromRegistry,
  getStepIndexForLessonInRegistry,
} from "./lessonNavigation";

export type { StepRegistry } from "./types";
export { areAllSublessonsCompleted } from "./lessonUtils";

export const lessonsRegistry: StepRegistry[] = [
  {
    step: 1,
    lessons: [
      {
        id: 1,
        title: "intro",
        description: "welcome to the stock market",
        lessonType: "info",
        unlockRequirements: {},
        sublessons: [
          {
            id: 101,
            title: "intro sublesson",
            description: "first steps",
            lessonType: "info",
          },
          {
            id: 102,
            title: "second sublesson",
            description: "more concepts",
            lessonType: "info",
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

// Find ANY lesson or sublesson by ID
export function getLessonById(id: number): LessonMetadata | undefined {
    // Check main lessons
    const main = getLessonMetadata(id);
    if (main) return main;

    // Check sublessons
    for (const step of lessonsRegistry) {
        for (const lesson of step.lessons) {
            if (lesson.sublessons) {
                const sub = lesson.sublessons.find(s => s.id === id);
                if (sub) return sub;
            }
        }
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

// Helper to check if a lesson is unlocked (all lessons are now unlocked)
export function isLessonUnlocked(
  lessonId: number,
  completedLessons: number[]
): boolean {
  // Flatten all lessons to treat them as a linear sequence
  const allLessons = lessonsRegistry.flatMap((s) => s.lessons);
  const index = allLessons.findIndex((l) => l.id === lessonId);

  // First lesson is always unlocked OR if lesson not found (safe default)
  if (index <= 0) return true;

  // Check if the IMMEDIATE PREVIOUS lesson is completed
  const prevLesson = allLessons[index - 1];

  if (prevLesson.sublessons && prevLesson.sublessons.length > 0) {
    return areAllSublessonsCompleted(prevLesson, completedLessons);
  }

  return completedLessons.includes(prevLesson.id);
}

// Find the next lesson ID in the sequence (uses bundled stub registry — prefer getNextLessonFromRegistry with API data)
export function getNextLessonId(currentLessonId: number): number | null {
  return (
    getNextLessonFromRegistry(lessonsRegistry, currentLessonId)?.lessonId ??
    null
  );
}

// Get the step index (0-based) for a given lesson ID
export function getStepIndexForLesson(lessonId: number): number | null {
  return getStepIndexForLessonInRegistry(lessonsRegistry, lessonId);
}
