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

export type PlayableLessonRef = {
  lessonId: number;
  unitId?: string;
  stepIndex: number;
};

function findInStep(
  step: StepRegistry,
  stepIndex: number,
  lessonId: number,
): LessonLocation | null {
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
  return null;
}

/** Find a main lesson or sublesson inside the live API registry. */
export function findLessonInRegistry(
  registry: StepRegistry[],
  lessonId: number,
  unitId?: string,
): LessonLocation | null {
  if (unitId) {
    const stepIndex = registry.findIndex((step) => step.unitId === unitId);
    if (stepIndex >= 0) {
      const match = findInStep(registry[stepIndex], stepIndex, lessonId);
      if (match) return match;
    }
  }

  for (let stepIndex = 0; stepIndex < registry.length; stepIndex++) {
    const match = findInStep(registry[stepIndex], stepIndex, lessonId);
    if (match) return match;
  }
  return null;
}

/** Linear playable lessons in map order (sublessons expand in place). */
export function buildFlatPlayableRefs(
  registry: StepRegistry[],
): PlayableLessonRef[] {
  const refs: PlayableLessonRef[] = [];
  for (let stepIndex = 0; stepIndex < registry.length; stepIndex++) {
    const step = registry[stepIndex];
    for (const lesson of step.lessons) {
      if (lesson.sublessons?.length) {
        for (const sub of lesson.sublessons) {
          refs.push({
            lessonId: sub.id,
            unitId: step.unitId,
            stepIndex,
          });
        }
      } else {
        refs.push({
          lessonId: lesson.id,
          unitId: step.unitId,
          stepIndex,
        });
      }
    }
  }
  return refs;
}

/** @deprecated Prefer buildFlatPlayableRefs — ids alone are ambiguous across units. */
export function buildFlatPlayableIds(registry: StepRegistry[]): number[] {
  return buildFlatPlayableRefs(registry).map((ref) => ref.lessonId);
}

function findPlayableIndex(
  refs: PlayableLessonRef[],
  lessonId: number,
  unitId?: string,
): number {
  if (unitId) {
    const scoped = refs.findIndex(
      (ref) => ref.lessonId === lessonId && ref.unitId === unitId,
    );
    if (scoped !== -1) return scoped;
  }
  return refs.findIndex((ref) => ref.lessonId === lessonId);
}

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
  for (const ref of buildFlatPlayableRefs(registry)) {
    if (completedSet.has(ref.lessonId)) continue;
    const location = findLessonInRegistry(
      registry,
      ref.lessonId,
      ref.unitId,
    );
    if (!location) continue;
    return {
      lessonId: ref.lessonId,
      title: location.lesson.title,
      unitId: ref.unitId,
      stepIndex: ref.stepIndex,
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

export type NextLessonTarget = {
  lessonId: number;
  unitId?: string;
  stepIndex: number;
};

/**
 * Next lesson in the user's path — always exactly one step ahead in map order.
 * Uses unitId when provided so reused lesson codes resolve to the correct unit.
 */
export function getNextLessonFromRegistry(
  registry: StepRegistry[],
  currentLessonId: number,
  currentUnitId?: string,
): NextLessonTarget | null {
  if (!registry.length) return null;

  const currentStepIndex =
    currentUnitId !== undefined
      ? registry.findIndex((step) => step.unitId === currentUnitId)
      : -1;
  const scopedSteps =
    currentStepIndex >= 0
      ? [{ step: registry[currentStepIndex], stepIndex: currentStepIndex }]
      : registry.map((step, stepIndex) => ({ step, stepIndex }));

  for (const { step, stepIndex } of scopedSteps) {
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

  const flat = buildFlatPlayableRefs(registry);
  const currentIndex = findPlayableIndex(flat, currentLessonId, currentUnitId);
  if (currentIndex === -1 || currentIndex >= flat.length - 1) {
    return null;
  }

  const next = flat[currentIndex + 1];
  return {
    lessonId: next.lessonId,
    unitId: next.unitId,
    stepIndex: next.stepIndex,
  };
}

export function getStepIndexForLessonInRegistry(
  registry: StepRegistry[],
  lessonId: number,
  unitId?: string,
): number | null {
  return findLessonInRegistry(registry, lessonId, unitId)?.stepIndex ?? null;
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
