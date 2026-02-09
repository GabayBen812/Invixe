import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import Svg, { SvgProps, SvgUri } from "react-native-svg";
import { parseSVGCode } from "../../utils/svgParser";
import HtmlText from "../ui/HtmlText";

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
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset state when options change (new step)
  React.useEffect(() => {
    setSelected({});
    setSubmitted(false);
    setShowingExplanation(false);
    setIsCorrect(false);
  }, [options.map((o) => o.id).join(",")]);

  // Expose state to parent for button management
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showingExplanation,
        canSubmit: Object.keys(selected).filter((k) => selected[k]).length > 0,
      });
    }
  }, [showingExplanation, selected, onStateChange]);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected],
  );

  // Get all correct option IDs
  const correctOptionIds = useMemo(() => {
    return options.filter((o) => o.correct).map((o) => o.id);
  }, [options]);

  // Check if selection is exactly correct: must select exactly all correct answers, no more, no less
  const allCorrect = useMemo(() => {
    // Get current selected IDs
    const currentSelectedIds = Object.keys(selected).filter((k) => selected[k]);

    // Get all correct option IDs
    const currentCorrectIds = options.filter((o) => o.correct).map((o) => o.id);

    // Must have at least one selection
    if (currentSelectedIds.length === 0) return false;

    // Must have at least one correct answer
    if (currentCorrectIds.length === 0) return false;

    // Must select exactly the same number as correct answers
    if (currentSelectedIds.length !== currentCorrectIds.length) {
      return false;
    }

    // All selected IDs must be in the correct set
    const allSelectedAreCorrect = currentSelectedIds.every((id) =>
      currentCorrectIds.includes(id),
    );

    // All correct IDs must be in the selected set
    const allCorrectAreSelected = currentCorrectIds.every((id) =>
      currentSelectedIds.includes(id),
    );

    // Both conditions must be true (they should be equivalent if lengths match, but checking both for safety)
    return allSelectedAreCorrect && allCorrectAreSelected;
  }, [selected, options]);

  const perOptionCorrectness = useMemo(() => {
    const res: Record<string, boolean> = {};
    options.forEach((o) => {
      const picked = !!selected[o.id];
      // correctness per option: if picked, it is correct only if option.correct
      // if not picked and option.correct, then it's an error
      res[o.id] = (picked && o.correct) || (!picked && !o.correct);
    });
    return res;
  }, [selected, options]);

  const numCorrectSelections = useMemo(() => {
    let count = 0;
    options.forEach((o) => {
      const picked = !!selected[o.id];
      if (picked && o.correct) count += 1;
    });
    return count;
  }, [selected, options]);

  const toggle = (id: string) => {
    if (submitted) return;
    setSelected((prev) => {
      const newSelected = { ...prev, [id]: !prev[id] };
      // Auto-submit when an option is selected and showSubmitButton is false
      if (
        !showSubmitButton &&
        Object.keys(newSelected).filter((k) => newSelected[k]).length > 0
      ) {
        // Don't auto-submit, let user see their selection
        // Submit will be triggered by parent button
      }
      return newSelected;
    });
  };

  // Check if this is a yes/no question: exactly 2 options and only 1 is correct
  const isYesNoQuestion =
    options.length === 2 && options.filter((o) => o.correct).length === 1;

  // For yes/no questions, only allow selecting one option (toggle behavior)
  const handleYesNoToggle = (id: string) => {
    if (submitted) return;
    setSelected((prev) => {
      // If clicking the same option, deselect it; otherwise, select only this one
      if (prev[id]) {
        return { ...prev, [id]: false };
      } else {
        // Deselect all others and select this one
        const newSelected: Record<string, boolean> = {};
        options.forEach((opt) => {
          newSelected[opt.id] = opt.id === id;
        });
        return newSelected;
      }
    });
  };

  const handleSubmit = React.useCallback(() => {
    if (Object.keys(selected).filter((k) => selected[k]).length === 0) return; // Can't submit without selection
    setSubmitted(true);

    // Recalculate allCorrect directly from current state to ensure accuracy
    const currentSelectedIds = Object.keys(selected).filter((k) => selected[k]);
    const currentCorrectIds = options.filter((o) => o.correct).map((o) => o.id);

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
    selected,
    options,
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

  const renderSVG = (
    option: SVGMultiSelectOption,
    isYesNoMode: boolean = false,
  ) => {
    // Handle PNG images
    if (option.inputType === "png" || option.pngPublicUrl || option.pngUrl) {
      const pngUrl = option.pngPublicUrl || option.pngUrl;
      if (pngUrl) {
        if (isYesNoMode) {
          return (
            <Image
              source={{ uri: pngUrl }}
              style={styles.yesNoPngImage}
              resizeMode="contain"
            />
          );
        }
        return (
          <View style={styles.svgContainer}>
            <Image
              source={{ uri: pngUrl }}
              style={styles.pngImage}
              resizeMode="contain"
            />
          </View>
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
      // Display SVG from URL as-is
      return <SvgUri uri={svgUrl} />;
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
          // For yes/no mode, use larger fixed size that fills the container
          const fixedSVG = React.cloneElement(
            parsedSVG as React.ReactElement<any>,
            {
              width: 120,
              height: 120,
              preserveAspectRatio: "xMidYMid meet",
            } as any,
          );
          return fixedSVG;
        }
        // For regular mode, use fixed size
        const fixedSVG = React.cloneElement(
          parsedSVG as React.ReactElement<any>,
          {
            width: 96,
            height: 96,
            preserveAspectRatio: "xMidYMid meet",
          } as any,
        );
        return <View style={styles.svgContainer}>{fixedSVG}</View>;
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
  if (!options || options.length === 0) {
    console.warn("SVGMultiSelectDrill: No options provided");
  }

  return (
    <View style={[styles.container, isYesNoQuestion && styles.containerYesNo]}>
      {title ? <HtmlText value={title} style={styles.title} /> : null}
      {options && options.length > 0 ? (
        isYesNoQuestion ? (
          // Yes/No question design with timeline - horizontal layout (no panel)
          <View style={styles.yesNoContainer}>
            <View style={[styles.yesNoRow, { position: "relative" }]}>
              {/* Left option */}
              {options[0] &&
                (() => {
                  const opt = options[0];
                  const picked = !!selected[opt.id];
                  const isCorrectAnswer = !!opt.correct;

                  let backgroundColor = "#F5F5F5";
                  let borderColor = "#FFFFFF";
                  let borderWidth = 1;

                  if (!submitted) {
                    if (picked) {
                      backgroundColor = "#F5F5F5";
                      borderColor = "#FFFFFF";
                      borderWidth = 1;
                    }
                  } else {
                    if (picked) {
                      if (isCorrectAnswer) {
                        backgroundColor = "#D1FADF";
                        borderColor = "#12B76A";
                      } else {
                        backgroundColor = "#FEE4E2";
                        borderColor = "#D92D20";
                      }
                    }
                  }

                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => handleYesNoToggle(opt.id)}
                      style={[
                        styles.yesNoBox,
                        styles.yesNoBoxLeft,
                        { backgroundColor, borderColor, borderWidth },
                      ]}
                    >
                      {opt.label ? (
                        <Text style={styles.yesNoLabel} numberOfLines={1}>
                          {opt.label}
                        </Text>
                      ) : null}
                      <View style={styles.yesNoContent}>
                        <View
                          style={[
                            styles.yesNoDot,
                            picked
                              ? styles.yesNoDotSelected
                              : styles.yesNoDotUnselected,
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
                        <View style={styles.yesNoSvgWrapper}>
                          {renderSVG(opt, true)}
                        </View>
                      </View>
                    </Pressable>
                  );
                })()}

              {/* Timeline in center */}
              <View style={styles.timelineContainer}>
                <View
                  style={[styles.timelineDiamond, styles.timelineDiamondTop]}
                />
                <View style={styles.timelineLine} />
                <View
                  style={[styles.timelineDiamond, styles.timelineDiamondBottom]}
                />
              </View>

              {/* Right option */}
              {options[1] &&
                (() => {
                  const opt = options[1];
                  const picked = !!selected[opt.id];
                  const isCorrectAnswer = !!opt.correct;

                  let backgroundColor = "#F5F5F5";
                  let borderColor = "#FFFFFF";
                  let borderWidth = 1;

                  if (!submitted) {
                    if (picked) {
                      backgroundColor = "#F5F5F5";
                      borderColor = "#FFFFFF";
                      borderWidth = 1;
                    }
                  } else {
                    if (picked) {
                      if (isCorrectAnswer) {
                        backgroundColor = "#D1FADF";
                        borderColor = "#12B76A";
                      } else {
                        backgroundColor = "#FEE4E2";
                        borderColor = "#D92D20";
                      }
                    }
                  }

                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => handleYesNoToggle(opt.id)}
                      style={[
                        styles.yesNoBox,
                        styles.yesNoBoxRight,
                        { backgroundColor, borderColor, borderWidth },
                      ]}
                    >
                      {opt.label ? (
                        <Text style={styles.yesNoLabel} numberOfLines={1}>
                          {opt.label}
                        </Text>
                      ) : null}
                      <View style={styles.yesNoContent}>
                        <View
                          style={[
                            styles.yesNoDot,
                            picked
                              ? styles.yesNoDotSelected
                              : styles.yesNoDotUnselected,
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
                        <View style={styles.yesNoSvgWrapper}>
                          {renderSVG(opt, true)}
                        </View>
                      </View>
                    </Pressable>
                  );
                })()}
            </View>
          </View>
        ) : (
          // Regular grid/list design
          <View style={styles.panel}>
            <View
              style={[
                styles.optionsContainer,
                layout === "grid" ? styles.grid : styles.list,
              ]}
            >
              {options.map((opt, index) => {
                const picked = !!selected[opt.id];
                const isCorrectAfterSubmit = submitted
                  ? perOptionCorrectness[opt.id]
                  : undefined;
                // Explicitly convert to boolean - handle undefined, null, string "true"/"false", etc.
                // Check if this option is marked as correct in the options array
                const isCorrectAnswer = !!opt.correct; // Whether this option is a correct answer

                // Base (neutral) state – white card like in Figma
                let backgroundColor = opt.backgroundColor || "#FFFFFF";
                let borderColor = "transparent";
                let borderWidth = 0;
                let textColor = "#0D2033";
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
                    backgroundColor = "#E0EDFF";
                    borderColor = "#3372D8";
                    borderWidth = 1;
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
                        {opt.label}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )
      ) : (
        <Text style={{ padding: 20, color: "#666" }}>No options available</Text>
      )}
      {showSubmitButton && (
        <Pressable
          style={[
            styles.submitButton,
            Object.keys(selected).filter((k) => selected[k]).length === 0 &&
              !showingExplanation &&
              styles.submitButtonDisabled,
          ]}
          onPress={showingExplanation ? handleContinue : handleSubmit}
          disabled={
            !showingExplanation &&
            Object.keys(selected).filter((k) => selected[k]).length === 0
          }
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
    paddingTop: 10,
  },
  containerYesNo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: -150,
  },
  panel: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 10,
    position: "relative",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  list: {
    flexDirection: "column",
  },
  optionCard: {
    width: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    // Shadow and border properties are set dynamically based on selection state
  },
  optionDot: {
    position: "absolute",
    top: 10,
    left: 10,
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
  svgContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
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
  pngImage: {
    width: 110,
    height: 110,
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
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  yesNoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  yesNoBox: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
  },
  yesNoBoxLeft: {
    marginRight: 12,
  },
  yesNoBoxRight: {
    marginLeft: 12,
  },
  yesNoLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D2033",
    textAlign: "center",
    marginBottom: 12,
    width: "100%",
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
    flex: 1,
    width: "100%",
    minHeight: 100,
  },
  yesNoPngImage: {
    width: 120,
    height: 120,
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
    position: "absolute",
    left: "50%",
    marginLeft: -20,
    top: -40,
    bottom: -40,
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
