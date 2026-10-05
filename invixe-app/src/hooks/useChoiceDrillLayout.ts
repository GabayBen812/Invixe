import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { useDrillViewportHeight } from "../components/lesson/DrillViewport";
import {
  computeChoiceDrillLayout,
  computeUniformChoiceRowHeight,
  estimateChoiceLineCount,
  getDrillChoicePlainText,
  type ChoiceDrillLayout,
  type ChoiceLike,
} from "../utils/drillFitLayout";

export function useChoiceDrillLayout(
  choiceCount: number,
  options?: { hasMedia?: boolean; gridCols?: number },
): ChoiceDrillLayout {
  const viewportHeight = useDrillViewportHeight();
  return useMemo(() => {
    const height = viewportHeight > 0 ? viewportHeight : 380;
    return computeChoiceDrillLayout(height, choiceCount, options);
  }, [viewportHeight, choiceCount, options?.hasMedia, options?.gridCols]);
}

/**
 * `horizontalInset` is the total horizontal space (both sides) between the
 * screen edge and the card edge.
 */
export function useUniformChoiceRowHeight(
  choices: ChoiceLike[],
  layout: ChoiceDrillLayout,
  maxCardWidth = 420,
  horizontalInset = 16,
): number {
  const { width: screenWidth, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const cardWidth = Math.min(maxCardWidth, screenWidth - horizontalInset);
    const contentWidth = cardWidth - layout.choicePaddingHorizontal * 2;
    const scale = Math.max(1, fontScale || 1);
    let maxLines = 1;

    for (const choice of choices) {
      const text = getDrillChoicePlainText(choice);
      maxLines = Math.max(
        maxLines,
        estimateChoiceLineCount(
          text,
          layout.choiceFontSize * scale,
          contentWidth,
        ),
      );
    }

    return computeUniformChoiceRowHeight(
      { ...layout, choiceLineHeight: layout.choiceLineHeight * scale },
      maxLines,
    );
  }, [
    choices,
    layout.choiceFontSize,
    layout.choiceLineHeight,
    layout.choicePaddingHorizontal,
    layout.choicePaddingVertical,
    maxCardWidth,
    horizontalInset,
    screenWidth,
    fontScale,
  ]);
}
