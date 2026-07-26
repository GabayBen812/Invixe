import type { ComponentType } from "react";
import type { StepRegistry } from "./types";
import { getPlayableLessonIds } from "./lessonNavigation";
import {
  FundamentalIcon,
  InvestmentIcon,
  TechnicalAnalysisIcon,
  TradingIcon,
} from "../../components/map/MapAssets";

const MINUTES_PER_LESSON = 3;

const COURSE_COPY_BY_STEP: Record<
  number,
  { title: string; description: string }
> = {
  1: {
    title: "מבוא לשוק ההון",
    description: "איך הבורסה עובדת, מושגי יסוד וניהול סיכונים",
  },
  2: {
    title: "ניתוח טכני",
    description: "נרות, מגמות, רמות מחיר ובניית אסטרטגיה",
  },
  3: {
    title: "השקעות לטווח ארוך",
    description: "בניית תיק, פיזור והשקעה חכמה לאורך זמן",
  },
  4: {
    title: "ניתוח פונדמנטלי",
    description: "הבנת חברות, דוחות, סקטורים וסימני אזהרה",
  },
};

export function getCourseTitle(step: Pick<StepRegistry, "step" | "title">): string {
  const fallback = COURSE_COPY_BY_STEP[step.step]?.title ?? `קורס ${step.step}`;
  return step.title?.trim() || fallback;
}

export function getCourseDescription(
  step: Pick<StepRegistry, "step" | "description">,
): string {
  const fallback = COURSE_COPY_BY_STEP[step.step]?.description ?? "";
  return step.description?.trim() || fallback;
}

export function countPlayableLessonsInUnit(
  step: Pick<StepRegistry, "lessons">,
): number {
  return getPlayableLessonIds(step.lessons).length;
}

export function formatCourseDurationMinutes(lessonCount: number): string {
  const minutes = Math.max(MINUTES_PER_LESSON, lessonCount * MINUTES_PER_LESSON);
  return `כ-${minutes} דק׳`;
}

export function getCourseDurationLabel(
  step: Pick<StepRegistry, "lessons">,
): string {
  return formatCourseDurationMinutes(countPlayableLessonsInUnit(step));
}

export function isCourseComingSoon(step: Pick<StepRegistry, "step">): boolean {
  return step.step === 3;
}

export function getCourseLevelLabel(step: Pick<StepRegistry, "step">): string {
  return step.step <= 2 ? "בסיסי" : "מתקדם";
}

export function getCourseIcon(
  step: Pick<StepRegistry, "step">,
): ComponentType<{ size?: number }> {
  switch (step.step) {
    case 1:
      return TradingIcon;
    case 2:
      return TechnicalAnalysisIcon;
    case 3:
      return InvestmentIcon;
    default:
      return FundamentalIcon;
  }
}
