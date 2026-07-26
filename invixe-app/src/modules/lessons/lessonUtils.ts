import type { LessonMetadata, LessonStep } from "./types";

export function areAllSublessonsCompleted(
  lesson: LessonMetadata,
  completedLessons: number[],
): boolean {
  if (!lesson.sublessons?.length) return false;
  return lesson.sublessons.every((s) => completedLessons.includes(s.id));
}

/** Trim step ids and navigation targets so CMS whitespace cannot end lessons early. */
export function normalizeLessonSteps(steps: LessonStep[]): LessonStep[] {
  return (steps || []).map((step) => {
    if (!step) return step;
    const normalized: LessonStep = {
      ...step,
      id: typeof step.id === "string" ? step.id.trim() : step.id,
    };
    if (Array.isArray(step.choices)) {
      normalized.choices = step.choices.map((choice) => {
        if (!choice) return choice;
        const nextStep =
          typeof choice.nextStep === "string"
            ? choice.nextStep.trim()
            : choice.nextStep;
        return { ...choice, nextStep };
      });
    }
    return normalized;
  });
}
