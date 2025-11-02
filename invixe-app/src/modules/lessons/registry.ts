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
