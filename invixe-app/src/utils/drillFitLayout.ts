import { sanitizeDisplayText, toPlainDisplayText } from "./decodeHtmlEntities";

export type ChoiceLike = Record<string, unknown>;

function coerceChoiceString(raw: unknown): string {
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "number" && !Number.isNaN(raw)) return String(raw);
  if (raw && typeof raw === "object") {
    const nested = raw as Record<string, unknown>;
    for (const key of ["text", "html", "value", "label"]) {
      const inner = coerceChoiceString(nested[key]);
      if (inner) return inner;
    }
  }
  return "";
}

/** Resolve choice label from builder/API variants. */
export function getDrillChoiceText(choice: ChoiceLike): string {
  const fields = [
    "text",
    "label",
    "speechbubbleText",
    "optionText",
    "optionLabel",
    "title",
    "name",
    "choiceText",
    "displayText",
    "answer",
    "buttonText",
    "caption",
    "value",
    "content",
    "description",
  ];
  for (const key of fields) {
    const value = coerceChoiceString(choice[key]);
    if (value) return sanitizeDisplayText(value);
  }
  return "";
}

/** Merge activityConfig choices with step-level choice text when labels are missing. */
export function normalizeDrillChoices<T extends ChoiceLike>(
  activityChoices: T[] | undefined | null,
  stepChoices?: ChoiceLike[] | null,
): T[] {
  const list = Array.isArray(activityChoices) ? activityChoices : [];
  const fallbacks = Array.isArray(stepChoices) ? stepChoices : [];
  return list.map((choice, index) => {
    const merged = { ...choice } as T & ChoiceLike;
    if (!getDrillChoiceText(merged)) {
      const byIndex = fallbacks[index];
      const byId =
        merged.id != null
          ? fallbacks.find((c) => c.id === merged.id)
          : undefined;
      const fallbackText = getDrillChoiceText(byIndex ?? byId ?? {});
      if (fallbackText) {
        (merged as ChoiceLike).text = fallbackText;
      }
    }
    return merged;
  });
}

/** Plain label for layout checks and plain Text rendering. */
export function getDrillChoicePlainText(choice: ChoiceLike): string {
  return toPlainDisplayText(getDrillChoiceText(choice));
}

/** Gap between media block and choice list — not the same as inter-choice gap. */
export const DRILL_MEDIA_STACK_GAP = 10;

/** Space reserved above the absolute בדוק / המשך button at the bottom of drills. */
export const DRILL_FLOATING_BUTTON_INSET = 108;

/** True when the choice stack would overflow the drill viewport (needs ScrollView). */
export function needsScrollableChoiceList(
  layout: ChoiceDrillLayout,
  viewportHeight: number,
  mediaHeight: number,
  bottomInset = DRILL_FLOATING_BUTTON_INSET,
): boolean {
  if (viewportHeight <= 0) {
    return layout.choicesMinHeight > 260;
  }
  const available =
    viewportHeight -
    layout.containerPadding * 2 -
    mediaHeight -
    DRILL_MEDIA_STACK_GAP -
    bottomInset;
  return layout.choicesMinHeight > available + 4;
}

export type ChoiceDrillLayout = {
  mediaHeight: number;
  choicesMinHeight: number;
  choicePaddingVertical: number;
  choicePaddingHorizontal: number;
  choiceFontSize: number;
  choiceGap: number;
  choiceLineHeight: number;
  containerPadding: number;
};

/** Estimate wrapped line count for a choice label at a given width. */
export function estimateChoiceLineCount(
  text: string,
  fontSize: number,
  contentWidth: number,
): number {
  const trimmed = text.trim();
  if (!trimmed) return 1;

  const approxCharWidth = fontSize * 0.54;
  const charsPerLine = Math.max(8, Math.floor(contentWidth / approxCharWidth));
  const words = trimmed.split(/\s+/);
  let lines = 1;
  let currentLen = 0;

  for (const word of words) {
    const wordLen = word.length;
    if (currentLen === 0) {
      currentLen = wordLen;
      continue;
    }
    if (currentLen + 1 + wordLen <= charsPerLine) {
      currentLen += 1 + wordLen;
    } else {
      lines += 1;
      currentLen = wordLen;
    }
  }

  return Math.min(lines, 6);
}

/** Fixed row height so every choice button matches the tallest label. */
export function computeUniformChoiceRowHeight(
  layout: ChoiceDrillLayout,
  lineCount: number,
): number {
  const lines = Math.max(1, lineCount);
  return layout.choicePaddingVertical * 2 + layout.choiceLineHeight * lines;
}

/** Fit choices (+ optional media) in the viewport with even, readable spacing. */
export function computeChoiceDrillLayout(
  viewportHeight: number,
  choiceCount: number,
  options?: { hasMedia?: boolean; gridCols?: number },
): ChoiceDrillLayout {
  const containerPadding = 10;
  const choicePaddingHorizontal = 14;
  const count = Math.max(1, choiceCount || 1);
  const hasMedia = options?.hasMedia === true;
  const gridCols = options?.gridCols ?? (count > 4 ? 2 : 1);
  const rows = Math.ceil(count / gridCols);

  const usable = Math.max(120, viewportHeight - containerPadding * 2);

  let padV = 12;
  let fontSize = 16;
  let gap = 10;

  const rowBlock = (p: number, f: number, g: number) =>
    p * 2 + f + 4 + g;

  if (hasMedia) {
    const stackGap = DRILL_MEDIA_STACK_GAP;
    let rowH = rowBlock(padV, fontSize, gap);
    let totalChoices = rows * rowH - gap;

    // Reserve space for answer labels first — never shrink text to zero height.
    const shrinkChoices = () => {
      while (totalChoices > usable * 0.55 && padV > 8) {
        padV -= 1;
        fontSize = Math.max(14, fontSize - 0.5);
        gap = Math.max(8, gap - 0.5);
        rowH = rowBlock(padV, fontSize, gap);
        totalChoices = rows * rowH - gap;
      }
    };
    shrinkChoices();

    const choicesMinHeight = Math.ceil(totalChoices);
    const mediaBudget = Math.max(80, usable - choicesMinHeight - stackGap - 8);
    const mediaCapFraction = count <= 2 ? 0.34 : 0.42;
    const mediaHeight = Math.min(
      Math.max(100, Math.floor(usable * mediaCapFraction)),
      mediaBudget,
    );

    return {
      mediaHeight: Math.round(mediaHeight),
      choicesMinHeight,
      choicePaddingVertical: Math.round(padV),
      choicePaddingHorizontal,
      choiceFontSize: Math.round(fontSize),
      choiceGap: Math.round(Math.min(14, gap)),
      choiceLineHeight: Math.round(Math.max(fontSize + 4, fontSize * 1.25)),
      containerPadding,
    };
  }

  // Choices only — grow gaps before shrinking text
  let rowH = rowBlock(padV, fontSize, gap);
  let total = rows * rowH - gap;

  if (total < usable) {
    const extra = usable - total;
    gap += extra / Math.max(1, rows - 1);
    gap = Math.min(16, gap);
  } else {
    while (total > usable && padV > 7) {
      padV -= 1;
      fontSize = Math.max(13, fontSize - 0.5);
      gap = Math.max(7, gap - 0.5);
      rowH = rowBlock(padV, fontSize, gap);
      total = rows * rowH - gap;
    }
  }

  return {
    mediaHeight: 0,
    choicesMinHeight: Math.ceil(total),
    choicePaddingVertical: Math.round(padV),
    choicePaddingHorizontal,
    choiceFontSize: Math.round(fontSize),
    choiceGap: Math.round(gap),
    choiceLineHeight: Math.round(fontSize * 1.25),
    containerPadding,
  };
}

export type StackDrillLayout = {
  imageHeight: number;
  textPadding: number;
  textFontSize: number;
  textLineHeight: number;
  gap: number;
};

export function computeStackDrillLayout(
  viewportHeight: number,
  options?: { hasImage?: boolean; textLines?: number },
): StackDrillLayout {
  const gap = 10;
  const textLines = options?.textLines ?? 4;
  const hasImage = options?.hasImage !== false;
  const usable = Math.max(120, viewportHeight - 16);

  const textBlockMin = 52;
  const textBlockMax = Math.min(110, textLines * 17 + 20);
  let textHeight = Math.min(
    textBlockMax,
    Math.max(textBlockMin, usable * 0.28),
  );
  let imageHeight = hasImage
    ? Math.min(170, Math.max(90, usable - textHeight - gap))
    : 0;

  if (hasImage && imageHeight + textHeight + gap > usable) {
    imageHeight = Math.max(80, usable - textHeight - gap);
  }

  const textFontSize = Math.max(13, Math.min(16, Math.floor(textHeight / 4.5)));
  return {
    imageHeight: Math.round(imageHeight),
    textPadding: 12,
    textFontSize,
    textLineHeight: Math.round(textFontSize * 1.35),
    gap,
  };
}
