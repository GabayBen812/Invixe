import type { LessonMetadata, StepRegistry } from "./types";
import { areAllSublessonsCompleted } from "./lessonUtils";

export { areAllSublessonsCompleted } from "./lessonUtils";

export type LessonLocation = {
  stepIndex: number;
  unitId?: string;
  lesson: LessonMetadata;
  parentLesson?: LessonMetadata;
  isSublesson: boolean;
};

/** Find a main lesson or sublesson inside the live API registry. */
export function findLessonInRegistry(
  registry: StepRegistry[],
  lessonId: number,
): LessonLocation | null {
  for (let stepIndex = 0; stepIndex < registry.length; stepIndex++) {
    const step = registry[stepIndex];
    for (const lesson of step.lessons) {
      if (lesson.id === lessonId) {
        return {
          stepIndex,
          unitId: step.unitId,
          lesson,
          isSublesson: false,
        };
      }
      if (lesson.sublessons?.length) {
        const sub = lesson.sublessons.find((s) => s.id === lessonId);
        if (sub) {
          return {
            stepIndex,
            unitId: step.unitId,
            lesson: sub,
            parentLesson: lesson,
            isSublesson: true,
          };
        }
      }
    }
  }
  return null;
}

/** Linear playable lesson ids: sublessons expand in order, else main lesson id. */
export type IncompleteLessonTarget = {
  lessonId: number;
  title: string;
  unitId?: string;
  stepIndex: number;
};

/** First playable lesson the user has not completed yet (map order). */
export function findFirstIncompleteLesson(
  registry: StepRegistry[],
  completedLessons: number[],
): IncompleteLessonTarget | null {
  const completedSet = new Set(completedLessons);
  for (const lessonId of buildFlatPlayableIds(registry)) {
    if (completedSet.has(lessonId)) continue;
    const location = findLessonInRegistry(registry, lessonId);
    if (!location) continue;
    return {
      lessonId,
      title: location.lesson.title,
      unitId: location.unitId,
      stepIndex: location.stepIndex,
    };
  }
  return null;
}

/** Units with at least one completed step but not fully done. */
export function countUnitsInProgress(
  registry: StepRegistry[],
  completedLessons: number[],
): number {
  let count = 0;
  for (const step of registry) {
    const { completed, total } = computeUnitProgress(
      step.lessons,
      completedLessons,
    );
    if (completed > 0 && completed < total) count += 1;
  }
  return count;
}

export function buildFlatPlayableIds(registry: StepRegistry[]): number[] {
  const ids: number[] = [];
  for (const step of registry) {
    for (const lesson of step.lessons) {
      if (lesson.sublessons?.length) {
        for (const sub of lesson.sublessons) {
          ids.push(sub.id);
        }
      } else {
        ids.push(lesson.id);
      }
    }
  }
  return ids;
}

export type NextLessonTarget = {
  lessonId: number;
  unitId?: string;
  stepIndex: number;
};

/**
 * Next lesson in the user's path (next sublesson, then next in unit order).
 * Uses the API-backed registry from LessonsContext — not the static stub file.
 */
export function getNextLessonFromRegistry(
  registry: StepRegistry[],
  currentLessonId: number,
): NextLessonTarget | null {
  if (!registry.length) return null;

  for (let stepIndex = 0; stepIndex < registry.length; stepIndex++) {
    const step = registry[stepIndex];
    for (const lesson of step.lessons) {
      if (!lesson.sublessons?.length) continue;
      const subIndex = lesson.sublessons.findIndex(
        (s) => s.id === currentLessonId,
      );
      if (subIndex !== -1 && subIndex < lesson.sublessons.length - 1) {
        return {
          lessonId: lesson.sublessons[subIndex + 1].id,
          unitId: step.unitId,
          stepIndex,
        };
      }
    }
  }

  const flat = buildFlatPlayableIds(registry);
  const currentIndex = flat.indexOf(currentLessonId);
  if (currentIndex === -1 || currentIndex >= flat.length - 1) {
    return null;
  }

  const nextId = flat[currentIndex + 1];
  const location = findLessonInRegistry(registry, nextId);
  if (!location) return null;

  return {
    lessonId: nextId,
    unitId: location.unitId,
    stepIndex: location.stepIndex,
  };
}

export function getStepIndexForLessonInRegistry(
  registry: StepRegistry[],
  lessonId: number,
): number | null {
  return findLessonInRegistry(registry, lessonId)?.stepIndex ?? null;
}

/** Playable step ids in a unit: each sublesson counts, or the main lesson if none. */
export function getPlayableLessonIds(lessons: LessonMetadata[]): number[] {
  const ids: number[] = [];
  for (const lesson of lessons) {
    if (lesson.sublessons?.length) {
      for (const sub of lesson.sublessons) {
        ids.push(sub.id);
      }
    } else {
      ids.push(lesson.id);
    }
  }
  return ids;
}

export function isLessonNodeCompleted(
  lesson: LessonMetadata,
  completedLessons: number[],
): boolean {
  if (lesson.sublessons?.length) {
    return areAllSublessonsCompleted(lesson, completedLessons);
  }
  return completedLessons.includes(lesson.id);
}

export type UnitProgressStats = {
  completed: number;
  total: number;
  percentage: number;
};

export function computeUnitProgress(
  lessons: LessonMetadata[],
  completedLessons: number[],
): UnitProgressStats {
  const playableIds = getPlayableLessonIds(lessons);
  const completedSet = new Set(completedLessons);
  const completed = playableIds.filter((id) => completedSet.has(id)).length;
  const total = playableIds.length;
  return {
    completed,
    total,
    percentage: total > 0 ? completed / total : 0,
  };
}

export function computeRegistryProgress(
  registry: StepRegistry[],
  completedLessons: number[],
): UnitProgressStats {
  const playableIds = registry.flatMap((step) =>
    getPlayableLessonIds(step.lessons),
  );
  const completedSet = new Set(completedLessons);
  const completed = playableIds.filter((id) => completedSet.has(id)).length;
  const total = playableIds.length;
  return {
    completed,
    total,
    percentage: total > 0 ? completed / total : 0,
  };
}
