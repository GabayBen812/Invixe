import { useMemo } from "react";
import { useDrillViewportHeight } from "../components/lesson/DrillViewport";
import {
  computeChoiceDrillLayout,
  type ChoiceDrillLayout,
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
