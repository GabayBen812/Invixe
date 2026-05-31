import type { LessonMetadata } from "./types";

export function areAllSublessonsCompleted(
  lesson: LessonMetadata,
  completedLessons: number[],
): boolean {
  if (!lesson.sublessons?.length) return false;
  return lesson.sublessons.every((s) => completedLessons.includes(s.id));
}
