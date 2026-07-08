import type { LessonMetadata, Sublesson } from "./types";

export type LessonTypeValue =
  | "info"
  | "memorize"
  | "test"
  | "practice"
  | "lesson";

export interface LessonVisualTheme {
  variant: "light" | "practice";
  screenBg: string;
  instructionText: string;
  choiceBg: string;
  choiceBorder: string;
  choiceText: string;
  choiceSelectedBg: string;
  choiceSelectedText: string;
  choiceYesBg: string;
  choiceNoBg: string;
  choiceCorrectBg: string;
  choiceWrongBg: string;
  choiceDisabledBg: string;
  choiceDisabledText: string;
  progressFill: string;
  progressTrack: string;
  confirmButtonBg: string;
  continueButtonCorrectBg: string;
  continueButtonWrongBg: string;
  speechBubbleBg: string;
  speechBubbleText: string;
  speechBubbleTail: string;
  /** Light panel behind charts/SVGs so asset labels stay readable */
  mediaSurfaceBg: string;
  mediaSurfaceBorder: string;
  /** Card behind option artwork (candlesticks, etc.) */
  assetCardBg: string;
  assetCardBorder: string;
  contentPanelBg: string;
}

export const lightTheme: LessonVisualTheme = {
  variant: "light",
  screenBg: "#E3EEF9",
  instructionText: "#0D2033",
  choiceBg: "#FFFFFF",
  choiceBorder: "#E5E7EB",
  choiceText: "#0D2033",
  choiceSelectedBg: "#3372D8",
  choiceSelectedText: "#FFFFFF",
  choiceYesBg: "#12B76A",
  choiceNoBg: "#D92D20",
  choiceCorrectBg: "#12B76A",
  choiceWrongBg: "#FF6B6B",
  choiceDisabledBg: "#F3F4F6",
  choiceDisabledText: "#9CA3AF",
  progressFill: "#3372D8",
  progressTrack: "#e0e0e0",
  confirmButtonBg: "#3F9FFF",
  continueButtonCorrectBg: "#3372D8",
  continueButtonWrongBg: "#D92D20",
  speechBubbleBg: "#FFFFFF",
  speechBubbleText: "#0D2033",
  speechBubbleTail: "#FFFFFF",
  mediaSurfaceBg: "transparent",
  mediaSurfaceBorder: "transparent",
  assetCardBg: "#FFFFFF",
  assetCardBorder: "#E5E7EB",
  contentPanelBg: "#FFFFFF",
};

export const practiceTheme: LessonVisualTheme = {
  variant: "practice",
  screenBg: "#0D1424",
  instructionText: "#F4F7FC",
  choiceBg: "#2B3F5E",
  choiceBorder: "rgba(255, 255, 255, 0.2)",
  choiceText: "#F4F7FC",
  choiceSelectedBg: "#2B4A7A",
  choiceSelectedText: "#FFFFFF",
  choiceYesBg: "#12B76A",
  choiceNoBg: "#D92D20",
  choiceCorrectBg: "#12B76A",
  choiceWrongBg: "#D92D20",
  choiceDisabledBg: "#141C2E",
  choiceDisabledText: "#6B7A94",
  progressFill: "#76D761",
  progressTrack: "rgba(255, 255, 255, 0.22)",
  confirmButtonBg: "#850AFF",
  continueButtonCorrectBg: "#12B76A",
  continueButtonWrongBg: "#D92D20",
  speechBubbleBg: "#1A2338",
  speechBubbleText: "#F4F7FC",
  speechBubbleTail: "#1A2338",
  mediaSurfaceBg: "#152038",
  mediaSurfaceBorder: "rgba(255, 255, 255, 0.1)",
  assetCardBg: "#152038",
  assetCardBorder: "rgba(255, 255, 255, 0.1)",
  contentPanelBg: "#121A2C",
};

export function normalizeLessonType(
  lessonType?: string | null,
  title?: string,
): LessonTypeValue {
  const t = String(lessonType || "").trim();
  const isTirgul = /תרגול/.test(title || "");
  if (t === "lesson") return isTirgul ? "practice" : "info";
  if (t === "info" && isTirgul) return "practice";
  return (t || "info") as LessonTypeValue;
}

export function isPracticeLesson(
  lessonType?: string | null,
  title?: string,
): boolean {
  return normalizeLessonType(lessonType, title) === "practice";
}

export function getLessonTheme(
  lessonType?: string | null,
  title?: string,
): LessonVisualTheme {
  return isPracticeLesson(lessonType, title) ? practiceTheme : lightTheme;
}

export function getThemeForLesson(
  lesson?: Pick<LessonMetadata | Sublesson, "lessonType" | "title"> | null,
): LessonVisualTheme {
  if (!lesson) return lightTheme;
  return getLessonTheme(lesson.lessonType, lesson.title);
}
