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

// Find the next lesson ID in the sequence (sublesson -> next sublesson -> next main lesson)
export function getNextLessonId(currentLessonId: number): number | null {
  // First, check if current is a sublesson and there's a next sublesson in the same group
  const parent = getParentLessonForSublesson(currentLessonId);
  if (parent && parent.sublessons) {
    const subIndex = parent.sublessons.findIndex((s) => s.id === currentLessonId);
    if (subIndex !== -1 && subIndex < parent.sublessons.length - 1) {
      return parent.sublessons[subIndex + 1].id;
    }
    // If it's the last sublesson, next is the next MAIN lesson (or its first sublesson?)
    // Actually, usually completing a node returns to map, so maybe this is where we stop if only intra-node nav is requested.
    // User said: "just move the user to the next sublesson... if return to home then return it to the map of the selected unit".
    // This implies if there IS a next sublesson, go there. If the node is done, probably go to map?
    // Let's implement valid next linear lesson logic regardless.
  }

  // If current is a main lesson (or last sublesson), find index in linear list
  const allLessons = lessonsRegistry.flatMap((s) => s.lessons);
  // Note: if currentLessonId was a sublesson, it won't be in main list directly unless we flatten properly.
  // Current structure: main lessons contain sublessons.
  // Let's make a truly flat list of all playable IDs for linear navigation
  const flatPlayableIds: number[] = [];
  lessonsRegistry.forEach(step => {
      step.lessons.forEach(lesson => {
          if (lesson.sublessons && lesson.sublessons.length > 0) {
              lesson.sublessons.forEach(sub => flatPlayableIds.push(sub.id));
          } else {
              flatPlayableIds.push(lesson.id);
          }
      });
  });

  const currentIndex = flatPlayableIds.indexOf(currentLessonId);
  if (currentIndex !== -1 && currentIndex < flatPlayableIds.length - 1) {
      return flatPlayableIds[currentIndex + 1];
  }

  return null;
}

// Get the step index (0-based) for a given lesson ID
export function getStepIndexForLesson(lessonId: number): number | null {
  for (let i = 0; i < lessonsRegistry.length; i++) {
    const step = lessonsRegistry[i];
    for (const lesson of step.lessons) {
      if (lesson.id === lessonId) return i;
      if (lesson.sublessons && lesson.sublessons.some(s => s.id === lessonId)) return i;
    }
  }
  return null;
}
