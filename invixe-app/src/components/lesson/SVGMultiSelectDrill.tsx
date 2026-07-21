import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import Svg, { SvgProps, SvgUri } from "react-native-svg";
import { parseSVGCode } from "../../utils/svgParser";
import { useDrillViewportHeight } from "./DrillViewport";
import HtmlText from "../ui/HtmlText";
import { useLessonTheme } from "../../context/LessonThemeContext";
import { toPlainDisplayText } from "../../utils/decodeHtmlEntities";

export interface SVGMultiSelectOption {
  id: string;
  label?: string;
  svgComponent?: React.ComponentType<SvgProps>;
  svgCode?: string; // Legacy: inline SVG code (for backward compatibility)
  svgUrl?: string; // Blob URL or public URL for preview
  svgPublicUrl?: string; // Supabase storage public URL
  svgPath?: string; // Storage path
  pngUrl?: string; // PNG blob URL or public URL
  pngPublicUrl?: string; // PNG Supabase storage public URL
  pngPath?: string; // PNG storage path
  inputType?: "svg" | "png"; // Type of input used
  backgroundColor?: string;
  correct: boolean;
}

interface Props {
  title?: string;
  options: SVGMultiSelectOption[];
  layout?: "grid" | "list";
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  showSubmitButton?: boolean;
  onStateChange?: (state: {
    showingExplanation: boolean;
    canSubmit: boolean;
  }) => void;
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onSubmit: (result: {
    selectedIds: string[];
    numCorrectSelections: number;
    perOptionCorrectness: Record<string, boolean>;
    allCorrect: boolean;
    isCorrect: boolean;
    explanation: string;
  }) => void;
}

function SVGMultiSelectDrill({
  title,
  options,
  layout = "grid",
  submitText = "בדוק",
  correctExplanation,
  wrongExplanation,
  showSubmitButton = true,
  onStateChange,
  onSubmitTriggerRef,
  onSubmit,
}: Props) {
  const { theme, isPractice } = useLessonTheme();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  /** Exclusive selection for binary (yes/no) drills — cannot select both. */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const normalizedOptions = useMemo(() => {
    const seen = new Set<string>();
    return options.map((o, index) => {
      const rawId = o?.id != null ? String(o.id).trim() : "";
      let id = rawId.length > 0 ? rawId : `option-${index}`;
      if (seen.has(id)) {
        id = `${id}-${index}`;
      }
      seen.add(id);
      return {
        ...o,
        id,
        correct: o.correct === true || (o.correct as unknown) === "true",
      };
    });
  }, [options]);

  const optionIdsKey = useMemo(
    () => normalizedOptions.map((o) => o.id).join(","),
    [normalizedOptions],
  );

  // Check if this is a yes/no question: exactly 2 options and only 1 is correct
  const isYesNoQuestion =
    normalizedOptions.length === 2 &&
    normalizedOptions.filter((o) => o.correct).length === 1;

  // Reset state when options change (new step)
  React.useEffect(() => {
    setSelected({});
    setSelectedId(null);
    setSubmitted(false);
    setShowingExplanation(false);
    setIsCorrect(false);
  }, [optionIdsKey]);

  const isOptionPicked = React.useCallback(
    (id: string) =>
      isYesNoQuestion ? selectedId === id : !!selected[id],
    [isYesNoQuestion, selectedId, selected],
  );

  const selectedIds = useMemo(() => {
    if (isYesNoQuestion) {
      return selectedId ? [selectedId] : [];
    }
    return Object.keys(selected).filter((k) => selected[k]);
  }, [isYesNoQuestion, selectedId, selected]);

  // Expose state to parent for button management
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showingExplanation,
        canSubmit: selectedIds.length > 0,
      });
    }
  }, [showingExplanation, selectedIds, onStateChange]);

  // Get all correct option IDs
  const correctOptionIds = useMemo(() => {
    return normalizedOptions.filter((o) => o.correct).map((o) => o.id);
  }, [normalizedOptions]);

  // Check if selection is exactly correct: must select exactly all correct answers, no more, no less
  const allCorrect = useMemo(() => {
    const currentSelectedIds = selectedIds;
    const currentCorrectIds = correctOptionIds;

    if (currentSelectedIds.length === 0) return false;
    if (currentCorrectIds.length === 0) return false;
    if (currentSelectedIds.length !== currentCorrectIds.length) return false;

    const allSelectedAreCorrect = currentSelectedIds.every((id) =>
      currentCorrectIds.includes(id),
    );
    const allCorrectAreSelected = currentCorrectIds.every((id) =>
      currentSelectedIds.includes(id),
    );

    return allSelectedAreCorrect && allCorrectAreSelected;
  }, [selectedIds, correctOptionIds]);

  const perOptionCorrectness = useMemo(() => {
    const res: Record<string, boolean> = {};
    normalizedOptions.forEach((o) => {
      const picked = isOptionPicked(o.id);
      res[o.id] = (picked && o.correct) || (!picked && !o.correct);
    });
    return res;
  }, [normalizedOptions, isOptionPicked]);

  const numCorrectSelections = useMemo(() => {
    let count = 0;
    normalizedOptions.forEach((o) => {
      if (isOptionPicked(o.id) && o.correct) count += 1;
    });
    return count;
  }, [normalizedOptions, isOptionPicked]);

  const toggle = (id: string) => {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Binary drills: radio behavior — exactly one selected id at a time
  const handleYesNoToggle = (id: string) => {
    if (submitted) return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const drillViewportHeight = useDrillViewportHeight();

  /** Two-option timeline layout — compact for icon SVGs, slightly taller when labels exist. */
  const yesNoHasLabels = useMemo(
    () => normalizedOptions.some((o) => (o.label?.trim().length ?? 0) > 0),
    [normalizedOptions],
  );
  const yesNoHasLongLabels = useMemo(
    () =>
      normalizedOptions.some(
        (o) => toPlainDisplayText(o.label || "").length > 24,
      ),
    [normalizedOptions],
  );

  const yesNoMediaSize = useMemo(() => {
    const timelineWidth = 40;
    const rowPadding = 16;
    const cardWidth = Math.max(
      136,
      Math.floor((screenWidth - rowPadding * 2 - timelineWidth - 16) / 2),
    );

    const labelAllowance = yesNoHasLongLabels ? 84 : yesNoHasLabels ? 40 : 0;
    const chromeAllowance = 36;

    let mediaHeight = yesNoHasLongLabels
      ? 16
      : yesNoHasLabels
        ? Math.min(100, Math.round(cardWidth * 0.45))
        : Math.min(128, Math.max(90, Math.round(cardWidth * 0.82)));

    const viewportCap =
      drillViewportHeight > 120
        ? Math.floor((drillViewportHeight - 96) * 0.38)
        : Math.floor(screenHeight * 0.2);

    mediaHeight = Math.min(mediaHeight, Math.max(88, viewportCap));
    const cardHeight = mediaHeight + labelAllowance + chromeAllowance;

    return { width: cardWidth, height: mediaHeight, cardHeight };
  }, [screenWidth, screenHeight, drillViewportHeight, yesNoHasLabels, yesNoHasLongLabels]);

  const yesNoBlockMinHeight = yesNoMediaSize.cardHeight + 12;

  const gridSvgSize = useMemo(() => {
    const containerWidth = Math.min(screenWidth - 32, 480);
    const cardWidth = Math.floor((containerWidth - 20) / 2);
    return Math.min(120, Math.max(88, Math.floor(cardWidth * 0.72)));
  }, [screenWidth]);

  const handleSubmit = React.useCallback(() => {
    if (selectedIds.length === 0) return;
    setSubmitted(true);

    const currentSelectedIds = selectedIds;
    const currentCorrectIds = correctOptionIds;

    let correct = false;
    if (currentSelectedIds.length > 0 && currentCorrectIds.length > 0) {
      if (currentSelectedIds.length === currentCorrectIds.length) {
        const allSelectedAreCorrect = currentSelectedIds.every((id) =>
          currentCorrectIds.includes(id),
        );
        const allCorrectAreSelected = currentCorrectIds.every((id) =>
          currentSelectedIds.includes(id),
        );
        correct = allSelectedAreCorrect && allCorrectAreSelected;
      }
    }

    setIsCorrect(correct);
    setShowingExplanation(true);

    const explanation = correct
      ? correctExplanation || ""
      : wrongExplanation || "";
    onSubmit({
      selectedIds: currentSelectedIds,
      numCorrectSelections,
      perOptionCorrectness,
      allCorrect: correct,
      isCorrect: correct,
      explanation,
    });
  }, [
    selectedIds,
    correctOptionIds,
    correctExplanation,
    wrongExplanation,
    numCorrectSelections,
    perOptionCorrectness,
    onSubmit,
  ]);

  const handleContinue = React.useCallback(() => {
    const explanation = isCorrect
      ? correctExplanation || ""
      : wrongExplanation || "";
    onSubmit({
      selectedIds,
      numCorrectSelections,
      perOptionCorrectness,
      allCorrect,
      isCorrect,
      explanation,
    });
  }, [
    isCorrect,
    correctExplanation,
    wrongExplanation,
    selectedIds,
    numCorrectSelections,
    perOptionCorrectness,
    allCorrect,
    onSubmit,
  ]);

  // Expose submit function to parent via ref (must be after handleSubmit is defined)
  React.useEffect(() => {
    if (onSubmitTriggerRef) {
      onSubmitTriggerRef.current = handleSubmit;
    }
    return () => {
      if (onSubmitTriggerRef) {
        onSubmitTriggerRef.current = null;
      }
    };
  }, [onSubmitTriggerRef, handleSubmit]);

  // Cache for parsed SVG code (only used for svgCode prop, not URLs)
  const parsedCacheRef = useRef<Record<string, React.ReactElement | null>>({});

  const renderYesNoMediaFrame = (content: React.ReactNode) => (
    <View
      style={[
        styles.yesNoSvgFrame,
        {
          width: yesNoMediaSize.width,
          height: yesNoMediaSize.height,
        },
      ]}
    >
      {content}
    </View>
  );

  const renderGridMediaFrame = (content: React.ReactNode) => (
    <View style={[styles.gridMediaFrame, { minHeight: gridSvgSize + 8 }]}>
      {content}
    </View>
  );

  const renderSVG = (
    option: SVGMultiSelectOption,
    isYesNoMode: boolean = false,
  ) => {
    const mediaW = yesNoMediaSize.width;
    const mediaH = yesNoMediaSize.height;

    // Handle PNG images
    if (option.inputType === "png" || option.pngPublicUrl || option.pngUrl) {
      const pngUrl = option.pngPublicUrl || option.pngUrl;
      if (pngUrl) {
        if (isYesNoMode) {
          return renderYesNoMediaFrame(
            <Image
              source={{ uri: pngUrl }}
              style={{ width: mediaW, height: mediaH }}
              resizeMode="contain"
            />,
          );
        }
        return (
          renderGridMediaFrame(
            <Image
              source={{ uri: pngUrl }}
              style={{ width: gridSvgSize, height: gridSvgSize }}
              resizeMode="contain"
            />,
          )
        );
      }
      return (
        <View style={styles.svgPlaceholder}>
          <Text style={styles.svgPlaceholderText}>...</Text>
        </View>
      );
    }

    // Handle SVG component - display as-is without forcing sizes
    if (option.svgComponent) {
      const SvgComponent = option.svgComponent;
      return <SvgComponent />;
    }

    // Priority: 1) svgPublicUrl/svgUrl (use SvgUri), 2) svgCode (parse)
    const svgUrl = option.svgPublicUrl || option.svgUrl;

    // If we have a URL, use SvgUri (native, reliable)
    if (svgUrl) {
      if (isYesNoMode) {
        return renderYesNoMediaFrame(
          <SvgUri
            uri={svgUrl}
            width={mediaW}
            height={mediaH}
            preserveAspectRatio="xMidYMid meet"
          />,
        );
      }
      return renderGridMediaFrame(
        <SvgUri
          uri={svgUrl}
          width={gridSvgSize}
          height={gridSvgSize}
          preserveAspectRatio="xMidYMid meet"
        />,
      );
    }

    // Fallback to parsing svgCode if provided
    if (option.svgCode && option.svgCode.trim()) {
      // Check parsed cache first to avoid re-parsing
      const cacheKey = `${option.id}-${option.svgCode.substring(0, 50)}`; // Use first 50 chars as hash
      if (parsedCacheRef.current[cacheKey]) {
        const cachedSVG = parsedCacheRef.current[cacheKey];
        // Display parsed SVG as-is
        return cachedSVG;
      }

      // Parse and render the SVG code using react-native-svg
      const parsedSVG = parseSVGCode(option.svgCode);
      if (parsedSVG) {
        // Cache the original parsed result
        parsedCacheRef.current[cacheKey] = parsedSVG;

        if (isYesNoMode) {
          const fixedSVG = React.cloneElement(
            parsedSVG as React.ReactElement<any>,
            {
              width: mediaW,
              height: mediaH,
              preserveAspectRatio: "xMidYMid meet",
            } as any,
          );
          return renderYesNoMediaFrame(fixedSVG);
        }
        // For regular mode, use fixed size
        const fixedSVG = React.cloneElement(
          parsedSVG as React.ReactElement<any>,
          {
            width: gridSvgSize,
            height: gridSvgSize,
            preserveAspectRatio: "xMidYMid meet",
          } as any,
        );
        return renderGridMediaFrame(fixedSVG);
      }
      // Fallback to placeholder if parsing fails
      return (
        <View style={styles.svgPlaceholder}>
          <Text style={styles.svgPlaceholderText}>SVG</Text>
        </View>
      );
    }

    return null;
  };

  // If showSubmitButton is false, we need a way to trigger submit from parent
  // For now, submit happens automatically when user selects options (for better UX)
  // Actually, we need to expose a submit trigger - but let's keep it simple:
  // The parent will show the button only when showingExplanation is true

  // Debug: log if options are empty
  if (!normalizedOptions || normalizedOptions.length === 0) {
    console.warn("SVGMultiSelectDrill: No options provided");
  }

  const renderYesNoOption = (
    opt: SVGMultiSelectOption,
    side: "left" | "right",
  ) => {
    const picked = isOptionPicked(opt.id);
    const isCorrectAnswer = !!opt.correct;

    let backgroundColor = isPractice ? theme.assetCardBg : "#F5F5F5";
    let borderColor = isPractice ? theme.assetCardBorder : "#E5E7EB";
    let borderWidth = 1;

    if (!submitted) {
      if (picked) {
        backgroundColor = isPractice ? theme.assetCardBg : "#EAF2FF";
        borderColor = isPractice ? theme.choiceSelectedBg : "#3372D8";
        borderWidth = 2;
      }
    } else if (picked) {
      if (isCorrectAnswer) {
        backgroundColor = "#D1FADF";
        borderColor = "#12B76A";
      } else {
        backgroundColor = "#FEE4E2";
        borderColor = "#D92D20";
      }
    }

    return (
      <Pressable
        key={opt.id}
        onPress={() => handleYesNoToggle(opt.id)}
        accessibilityRole="radio"
        accessibilityState={{ selected: picked }}
        style={[
          styles.yesNoBox,
          side === "left" ? styles.yesNoBoxLeft : styles.yesNoBoxRight,
          {
            backgroundColor,
            borderColor,
            borderWidth,
            minHeight: yesNoMediaSize.cardHeight,
          },
        ]}
      >
        {opt.label ? (
          <Text
            style={styles.yesNoLabel}
            numberOfLines={yesNoHasLongLabels ? 4 : 1}
          >
            {toPlainDisplayText(opt.label)}
          </Text>
        ) : null}
        <View style={styles.yesNoContent}>
          <View
            style={[
              styles.yesNoDot,
              picked ? styles.yesNoDotSelected : styles.yesNoDotUnselected,
              submitted &&
                picked &&
                isCorrectAnswer &&
                styles.yesNoDotCorrect,
              submitted &&
                picked &&
                !isCorrectAnswer &&
                styles.yesNoDotWrong,
            ]}
          />
          <View style={styles.yesNoSvgWrapper} pointerEvents="none">
            {renderSVG(opt, true)}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isYesNoQuestion && styles.containerYesNo,
        isYesNoQuestion && { minHeight: yesNoBlockMinHeight },
      ]}
    >
      {title ? (
        <HtmlText
          value={title}
          style={[styles.title, isPractice && { color: theme.instructionText }]}
        />
      ) : null}
      {normalizedOptions.length > 0 ? (
        isYesNoQuestion ? (
          <View style={styles.yesNoContainer}>
            <View style={styles.yesNoRow}>
              {renderYesNoOption(normalizedOptions[0], "left")}

              <View
                style={[
                  styles.timelineContainer,
                  { height: yesNoMediaSize.cardHeight },
                ]}
                pointerEvents="none"
              >
                <View
                  style={[styles.timelineDiamond, styles.timelineDiamondTop]}
                />
                <View style={styles.timelineLine} />
                <View
                  style={[styles.timelineDiamond, styles.timelineDiamondBottom]}
                />
              </View>

              {renderYesNoOption(normalizedOptions[1], "right")}
            </View>
          </View>
        ) : (
          // Regular grid/list — option cards only, no outer panel wrapper
          <View
            style={[
              styles.optionsContainer,
              layout === "grid" ? styles.grid : styles.list,
            ]}
          >
            {normalizedOptions.map((opt, index) => {
                const picked = isOptionPicked(opt.id);
                const isCorrectAnswer = !!opt.correct;

                const hasVisualAsset =
                  !!opt.svgCode ||
                  !!opt.svgUrl ||
                  !!opt.svgPublicUrl ||
                  !!opt.pngUrl ||
                  !!opt.pngPublicUrl ||
                  !!opt.svgComponent;

                // Base (neutral) state – light card for artwork, navy for text-only
                let backgroundColor =
                  opt.backgroundColor ||
                  (isPractice
                    ? hasVisualAsset
                      ? theme.assetCardBg
                      : theme.choiceBg
                    : "#FFFFFF");
                let borderColor =
                  isPractice && hasVisualAsset
                    ? theme.assetCardBorder
                    : "transparent";
                let borderWidth = isPractice && hasVisualAsset ? 1 : 0;
                let textColor = isPractice
                  ? hasVisualAsset
                    ? "#0D2033"
                    : theme.choiceText
                  : "#0D2033";
                let shadowStyle: any = {
                  shadowColor: "transparent",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0,
                  shadowRadius: 0,
                  elevation: 0,
                };

                if (!submitted) {
                  if (picked) {
                    // Selected before submit – blue highlight
                    backgroundColor = isPractice
                      ? theme.choiceSelectedBg
                      : "#E0EDFF";
                    borderColor = isPractice ? "transparent" : "#3372D8";
                    borderWidth = isPractice ? 0 : 1;
                    textColor = isPractice ? "#FFFFFF" : textColor;
                    shadowStyle = {
                      shadowColor: "#101828",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 2,
                    };
                  }
                } else {
                  // After submit – only change background/dot for options the user PICKED
                  if (picked) {
                    borderWidth = 1;
                    shadowStyle = {
                      shadowColor: "#101828",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 2,
                    };
                    if (isCorrectAnswer) {
                      backgroundColor = "#D1FADF";
                      borderColor = "#12B76A";
                    } else {
                      backgroundColor = "#FEE4E2";
                      borderColor = "#D92D20";
                    }
                  }
                  // Unpicked options stay neutral (no green/red)
                  textColor = "#0D2033";
                }

                return (
                  <Pressable
                    key={`${opt.id}-${index}`}
                    onPress={() => toggle(opt.id)}
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor,
                        borderColor,
                        borderWidth,
                      },
                      shadowStyle,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionDot,
                        !submitted && picked && styles.optionDotSelected,
                        submitted &&
                          picked &&
                          isCorrectAnswer &&
                          styles.optionDotCorrect,
                        submitted &&
                          picked &&
                          !isCorrectAnswer &&
                          styles.optionDotWrong,
                      ]}
                    />
                    {renderSVG(opt)}
                    {opt.label ? (
                      <Text style={[styles.optionLabel, { color: textColor }]}>
                        {toPlainDisplayText(opt.label)}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
          </View>
        )
      ) : (
        <Text style={{ padding: 20, color: "#666" }}>No options available</Text>
      )}
      {showSubmitButton && (
        <Pressable
          style={[
            styles.submitButton,
            selectedIds.length === 0 &&
              !showingExplanation &&
              styles.submitButtonDisabled,
          ]}
          onPress={showingExplanation ? handleContinue : handleSubmit}
          disabled={!showingExplanation && selectedIds.length === 0}
        >
          <Text style={styles.submitText}>
            {showingExplanation ? "המשך" : submitText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: 4,
  },
  containerYesNo: {
    width: "100%",
    flexShrink: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D2033",
    marginBottom: 10,
  },
  optionsContainer: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    columnGap: 10,
  },
  list: {
    flexDirection: "column",
  },
  optionCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginVertical: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    // Shadow and border properties are set dynamically based on selection state
  },
  optionDot: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E4E7EC",
  },
  optionDotSelected: {
    backgroundColor: "#3372D8",
  },
  optionDotCorrect: {
    backgroundColor: "#12B76A",
  },
  optionDotWrong: {
    backgroundColor: "#D92D20",
  },
  gridMediaFrame: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  svgPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  svgPlaceholderText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  submitButton: {
    marginTop: 18,
    backgroundColor: "#3F9FFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  // Yes/No question styles
  yesNoContainer: {
    width: "100%",
    flexShrink: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  yesNoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  yesNoBox: {
    flex: 1,
    flexShrink: 0,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  yesNoBoxLeft: {
    marginRight: 12,
  },
  yesNoBoxRight: {
    marginLeft: 12,
  },
  yesNoLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D2033",
    textAlign: "center",
    marginBottom: 8,
    width: "100%",
    lineHeight: 21,
  },
  yesNoContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  yesNoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: "center",
  },
  yesNoSvgWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  yesNoSvgFrame: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  yesNoPngImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  yesNoDotUnselected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  yesNoDotSelected: {
    backgroundColor: "#3372D8",
    borderWidth: 0,
  },
  yesNoDotCorrect: {
    backgroundColor: "#12B76A",
    borderWidth: 0,
  },
  yesNoDotWrong: {
    backgroundColor: "#D92D20",
    borderWidth: 0,
  },
  timelineContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    zIndex: 0,
  },
  timelineLine: {
    width: 3,
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "#3F9FFF",
    borderRadius: 1.5,
  },
  timelineDiamond: {
    width: 16,
    height: 16,
    backgroundColor: "#3F9FFF",
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    zIndex: 2,
  },
  timelineDiamondTop: {
    top: 0,
    marginTop: -8,
  },
  timelineDiamondBottom: {
    bottom: 0,
    marginBottom: -8,
  },
});

export default SVGMultiSelectDrill;
