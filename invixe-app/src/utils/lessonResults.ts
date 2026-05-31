import theme from "../theme";

export type LessonGrade = {
  letter: string;
  label: string;
  color: string;
};

export function formatLessonDuration(durationMs: number): string {
  const totalSec = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function computeAccuracyPercent(
  correctCount: number,
  totalGraded: number,
): number | null {
  if (totalGraded <= 0) return null;
  return Math.min(100, Math.round((correctCount / totalGraded) * 100));
}

export function gradeFromAccuracy(accuracy: number | null): LessonGrade {
  if (accuracy === null) {
    return {
      letter: "✓",
      label: "הושלם",
      color: theme.colors.primary[500],
    };
  }
  if (accuracy >= 95) {
    return { letter: "A+", label: "מצוין", color: theme.colors.success[600] };
  }
  if (accuracy >= 85) {
    return { letter: "A", label: "מעולה", color: theme.colors.success[600] };
  }
  if (accuracy >= 75) {
    return { letter: "B+", label: "טוב מאוד", color: theme.colors.primary[500] };
  }
  if (accuracy >= 65) {
    return { letter: "B", label: "טוב", color: theme.colors.primary[500] };
  }
  if (accuracy >= 50) {
    return { letter: "C", label: "בסדר", color: theme.colors.warning[600] };
  }
  return { letter: "D", label: "נסה שוב", color: theme.colors.error[600] };
}

export function countGradedFromDrillResult(result: {
  isCorrect?: boolean;
  correct?: boolean;
  allCorrect?: boolean;
  numCorrect?: number;
  numCorrectSelections?: number;
  total?: number;
  perOptionCorrectness?: Record<string, boolean>;
}): { correct: number; total: number } {
  // Per-item drills (e.g. drag-match): each matched slot counts separately.
  if (result.numCorrect !== undefined) {
    return {
      correct: result.numCorrect,
      total: result.total ?? 1,
    };
  }

  // Single-question drills (yes/no SVG multi-select, graph, etc.): one attempt per step.
  const hasDrillOutcome =
    result.isCorrect !== undefined ||
    result.correct !== undefined ||
    result.allCorrect !== undefined;

  if (hasDrillOutcome) {
    const isCorrect = Boolean(
      result.isCorrect ?? result.correct ?? result.allCorrect,
    );
    return { correct: isCorrect ? 1 : 0, total: 1 };
  }

  if (result.numCorrectSelections !== undefined) {
    const optionCount = result.perOptionCorrectness
      ? Object.keys(result.perOptionCorrectness).length
      : 0;
    return {
      correct: result.numCorrectSelections,
      total: result.total ?? (optionCount > 0 ? optionCount : 1),
    };
  }

  return { correct: 0, total: 1 };
}
