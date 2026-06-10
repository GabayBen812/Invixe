import React, { createContext, useContext, useMemo } from "react";
import {
  LessonVisualTheme,
  lightTheme,
  getThemeForLesson,
  isPracticeLesson,
} from "../modules/lessons/lessonTheme";
import type { LessonMetadata, Sublesson } from "../modules/lessons/types";

type LessonThemeContextValue = {
  theme: LessonVisualTheme;
  isPractice: boolean;
};

const LessonThemeContext = createContext<LessonThemeContextValue>({
  theme: lightTheme,
  isPractice: false,
});

export function LessonThemeProvider({
  lesson,
  children,
}: {
  lesson?: Pick<LessonMetadata | Sublesson, "lessonType" | "title"> | null;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const theme = getThemeForLesson(lesson);
    return {
      theme,
      isPractice: isPracticeLesson(lesson?.lessonType, lesson?.title),
    };
  }, [lesson?.lessonType, lesson?.title]);

  return (
    <LessonThemeContext.Provider value={value}>
      {children}
    </LessonThemeContext.Provider>
  );
}

export function useLessonTheme() {
  return useContext(LessonThemeContext);
}
