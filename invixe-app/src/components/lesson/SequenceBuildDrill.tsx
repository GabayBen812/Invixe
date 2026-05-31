import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
} from "react-native";
import {
  BullishCandleSVG,
  BearishCandleSVG,
  DojiCandleSVG,
} from "./CandlestickSVGs";
import {
  DragonflyDoji,
  InvertedHammerNew,
  RegularDoji,
  ShootingStar,
  Hammer,
  BullishEngulfing,
  BearishEngulfing,
} from "../../assets/Candels";
import { parseSVGCode } from "../../utils/svgParser";
import { fetchRemoteText } from "../../utils/remoteAssetCache";

type CandleKey =
  | "bullish"
  | "bearish"
  | "doji"
  | "hammer"
  | "invertedHammerNew"
  | "dragonflyDoji"
  | "regularDoji"
  | "bullishEngulfing"
  | "bearishEngulfing"
  | "shootingStar";

export interface SequenceOption {
  id: string;
  candleKey: CandleKey;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string;
  svgPath?: string;
}

interface Props {
  slotsCount: number;
  options: SequenceOption[];
  correctSequence?: string[]; // DEPRECATED: use correctSequences instead. Kept for backward compatibility
  correctSequences?: string[][]; // array of arrays, each array is a valid sequence of option ids
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onSubmit: (payload: {
    correct: boolean;
    placedIds: (string | undefined)[];
    isCorrect: boolean;
    explanation: string;
  }) => void;
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onStateChange?: (state: {
    showingExplanation: boolean;
    canSubmit: boolean;
  }) => void;
}

const CandleByKey = ({ keyName }: { keyName: CandleKey }) => {
  switch (keyName) {
    case "bullish":
      return <BullishCandleSVG width={36} height={110} />;
    case "bearish":
      return <BearishCandleSVG width={36} height={110} />;
    case "doji":
      return <DojiCandleSVG width={40} height={110} />;
    case "hammer":
      return <Hammer width={40} height={120} />;
    case "invertedHammerNew":
      return <InvertedHammerNew width={40} height={120} />;
    case "dragonflyDoji":
      return <DragonflyDoji width={40} height={110} />;
    case "regularDoji":
      return <RegularDoji width={40} height={110} />;
    case "bullishEngulfing":
      return <BullishEngulfing width={110} height={110} />;
    case "bearishEngulfing":
      return <BearishEngulfing width={110} height={110} />;
    case "shootingStar":
      return <ShootingStar width={40} height={120} />;
    default:
      return null;
  }
};

const renderOptionContent = (
  option: SequenceOption,
  svgCache: Record<string, string>,
  parsedCacheRef: React.MutableRefObject<Record<string, React.ReactElement>>,
) => {
  // Priority: 1) svgPublicUrl (from cache), 2) svgCode, 3) svgUrl (from cache), 4) candleKey
  let svgCodeToParse: string | undefined;

  if (option.svgPublicUrl && svgCache[option.id]) {
    svgCodeToParse = svgCache[option.id];
  } else if (option.svgCode) {
    svgCodeToParse = option.svgCode;
  } else if (option.svgUrl && svgCache[option.id]) {
    svgCodeToParse = svgCache[option.id];
  }

  if (svgCodeToParse) {
    const cacheKey = `${option.id}-${svgCodeToParse.substring(0, 50)}`;
    let svgElement = parsedCacheRef.current[cacheKey];

    if (!svgElement) {
      const parsedSVG = parseSVGCode(svgCodeToParse);
      if (parsedSVG) {
        parsedCacheRef.current[cacheKey] = parsedSVG;
        svgElement = parsedSVG;
      }
    }

    if (svgElement) {
      // Clone element to enforce dimensions to match optionCandle container
      // Using a smaller size (50x100) inside the 70x110 container prevents "too big" look
      // and ensures content is centered with breathing room
      return React.cloneElement(
        svgElement as React.ReactElement<any>,
        {
          width: 50,
          height: 90,
          preserveAspectRatio: "xMidYMid meet",
        } as any,
      );
    }
  }

  // Fallback to candleKey
  return <CandleByKey keyName={option.candleKey} />;
};

export default function SequenceBuildDrill({
  slotsCount,
  options,
  correctSequence,
  correctSequences,
  submitText = "אישור",
  correctExplanation,
  wrongExplanation,
  onSubmit,
  onSubmitTriggerRef,
  onStateChange,
}: Props) {
  // Support both old format (correctSequence) and new format (correctSequences)
  // If correctSequence exists, convert it to correctSequences for backward compatibility
  const validSequences: string[][] =
    correctSequences || (correctSequence ? [correctSequence] : []);
  const [placed, setPlaced] = useState<(string | undefined)[]>(
    Array(slotsCount).fill(undefined),
  );
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const parsedCacheRef = useRef<Record<string, React.ReactElement>>({});

  // Drag state management
  const [draggingOptionId, setDraggingOptionId] = useState<string | null>(null);
  const draggingOptionIdRef = useRef<string | null>(null);
  const bankLayout = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const optionsRowRef = useRef<View | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    draggingOptionIdRef.current = draggingOptionId;
  }, [draggingOptionId]);

  const slotRefs = useRef<(View | null)[]>([]);
  const slotLayouts = useRef<
    { x: number; y: number; width: number; height: number }[]
  >([]);
  const optionInitialPositions = useRef<
    Record<string, { x: number; y: number }>
  >({});
  const optionRefs = useRef<Record<string, View | null>>({});
  const optionLayouts = useRef<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});
  const optionOriginalBankLayouts = useRef<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});
  const panValues = useRef<Record<string, Animated.ValueXY>>({}).current;

  // Magnetic snap threshold (distance in pixels)
  const MAGNETIC_THRESHOLD = 100;

  // Fetch SVGs from URLs
  useEffect(() => {
    const fetchSVGs = async () => {
      const promises = options.map(async (option) => {
        if (option.svgPublicUrl && !svgCache[option.id]) {
          try {
            const text = await fetchRemoteText(option.svgPublicUrl);
            setSvgCache((prev) => ({ ...prev, [option.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${option.id}:`, e);
          }
        } else if (option.svgUrl && !svgCache[option.id]) {
          try {
            const text = await fetchRemoteText(option.svgUrl);
            setSvgCache((prev) => ({ ...prev, [option.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${option.id}:`, e);
          }
        }
      });
      await Promise.all(promises);
    };
    fetchSVGs();
  }, [options.map((o) => o.svgPublicUrl || o.svgUrl || o.id).join(",")]);

  // Calculate distance between two points
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Get center point of a layout
  const getCenter = (layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    return {
      x: layout.x + layout.width / 2,
      y: layout.y + layout.height / 2,
    };
  };

  // Detect which zone a point is in: 'slot', 'bank', or 'middle'
  const detectDropZone = (
    screenX: number,
    screenY: number,
  ): {
    zone: "slot" | "bank" | "middle";
    slotIndex?: number;
    slotCenter?: { x: number; y: number };
  } => {
    // Check if over any slot
    for (let i = 0; i < slotLayouts.current.length; i++) {
      const layout = slotLayouts.current[i];
      if (!layout || !layout.width) continue;
      const within =
        screenX >= layout.x &&
        screenX <= layout.x + layout.width &&
        screenY >= layout.y &&
        screenY <= layout.y + layout.height;
      if (within) {
        return { zone: "slot", slotIndex: i, slotCenter: getCenter(layout) };
      }
    }

    // Check if over bank area
    if (bankLayout.current) {
      const bank = bankLayout.current;
      const within =
        screenX >= bank.x &&
        screenX <= bank.x + bank.width &&
        screenY >= bank.y &&
        screenY <= bank.y + bank.height;
      if (within) {
        return { zone: "bank" };
      }
    }

    // Otherwise it's in the middle
    return { zone: "middle" };
  };

  // Handle slot replacement: return old option to bank, then place new option
  const handleSlotReplacement = (slotIndex: number, newOptionId: string) => {
    const oldOptionId = placed[slotIndex];

    if (oldOptionId && oldOptionId !== newOptionId && panValues[oldOptionId]) {
      // Return old option to bank (position 0,0 relative to its initial position)
      Animated.spring(panValues[oldOptionId], {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
        tension: 120,
        friction: 7,
      }).start();

      // Clear old option from slot
      setPlaced((prev) => {
        const next = [...prev];
        next[slotIndex] = undefined;
        return next;
      });
    }
  };

  const attachPanResponder = (option: SequenceOption) => {
    if (!panValues[option.id])
      panValues[option.id] = new Animated.ValueXY({ x: 0, y: 0 });

    return PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // Only allow drag if no other option is being dragged
        return (
          draggingOptionIdRef.current === null ||
          draggingOptionIdRef.current === option.id
        );
      },
      onMoveShouldSetPanResponder: () => {
        // Also check on move to prevent other options from taking over
        return (
          draggingOptionIdRef.current === null ||
          draggingOptionIdRef.current === option.id
        );
      },
      onPanResponderTerminationRequest: () => {
        // Don't allow termination if this is the active drag
        return draggingOptionIdRef.current !== option.id;
      },
      onPanResponderGrant: (evt) => {
        // Prevent multiple drags
        if (
          draggingOptionIdRef.current !== null &&
          draggingOptionIdRef.current !== option.id
        ) {
          return;
        }

        draggingOptionIdRef.current = option.id;
        setDraggingOptionId(option.id);

        // Get current animated values (including any offset)
        const currentX = (panValues[option.id].x as any)._value || 0;
        const currentY = (panValues[option.id].y as any)._value || 0;
        const offsetX = (panValues[option.id].x as any)._offset || 0;
        const offsetY = (panValues[option.id].y as any)._offset || 0;
        const totalX = currentX + offsetX;
        const totalY = currentY + offsetY;

        // Measure the CURRENT center position RIGHT NOW (before we change the offset)
        // This is the actual position the option is at when we start dragging
        const optionRef = optionRefs.current[option.id];
        if (optionRef) {
          (optionRef as any).measureInWindow(
            (x: number, y: number, width: number, height: number) => {
              // Store the current center position as the "initial" position for this drag
              // This accounts for the option being in a slot or in the bank
              optionInitialPositions.current[option.id] = {
                x: x + width / 2,
                y: y + height / 2,
              };
            },
          );
        }

        // Store current total position as offset for the drag
        panValues[option.id].setOffset({ x: totalX, y: totalY });
        panValues[option.id].setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        // Only allow movement if this is the active dragging option
        if (draggingOptionIdRef.current !== option.id) {
          return;
        }

        // Follow finger directly - no magnetic effects during drag
        // The snap will happen on release
        panValues[option.id].setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        // Only process if this is the active dragging option
        if (draggingOptionIdRef.current !== option.id) {
          return;
        }

        // Flatten offset to get final position
        panValues[option.id].flattenOffset();

        const screenX = gesture.moveX;
        const screenY = gesture.moveY;

        // Re-measure all layouts immediately
        slotRefs.current.forEach((ref, i) => {
          if (ref) {
            (ref as any).measureInWindow(
              (x: number, y: number, width: number, height: number) => {
                slotLayouts.current[i] = { x, y, width, height };
              },
            );
          }
        });

        if (optionsRowRef.current) {
          (optionsRowRef.current as any).measureInWindow(
            (x: number, y: number, width: number, height: number) => {
              bankLayout.current = { x, y, width, height };
            },
          );
        }

        // Re-measure the option's current position to get accurate center
        // This ensures we have the most up-to-date position
        const optionRef = optionRefs.current[option.id];
        let currentCenter: { x: number; y: number } | null = null;

        if (optionRef) {
          (optionRef as any).measureInWindow(
            (x: number, y: number, width: number, height: number) => {
              currentCenter = {
                x: x + width / 2,
                y: y + height / 2,
              };

              // Process drop after measurement completes
              requestAnimationFrame(() => {
                if (!currentCenter) {
                  // Fallback to stored initial position
                  const originalCenter =
                    optionInitialPositions.current[option.id];
                  if (!originalCenter) {
                    panValues[option.id].setValue({ x: 0, y: 0 });
                    draggingOptionIdRef.current = null;
                    setDraggingOptionId(null);
                    return;
                  }
                  currentCenter = originalCenter;
                }

                const dropZone = detectDropZone(screenX, screenY);

                // ONLY allow placement in slots - everything else goes back to bank
                if (
                  dropZone.zone === "slot" &&
                  dropZone.slotIndex !== undefined &&
                  dropZone.slotCenter &&
                  currentCenter
                ) {
                  // Valid drop: on a slot - snap to center
                  handleSlotReplacement(dropZone.slotIndex, option.id);

                  // Calculate offset from current center position to slot center
                  const offsetX = dropZone.slotCenter.x - currentCenter.x;
                  const offsetY = dropZone.slotCenter.y - currentCenter.y;

                  // Get current animated values and add the offset
                  const currentX = (panValues[option.id].x as any)._value || 0;
                  const currentY = (panValues[option.id].y as any)._value || 0;

                  const targetX = currentX + offsetX;
                  const targetY = currentY + offsetY;

                  Animated.spring(panValues[option.id], {
                    toValue: { x: targetX, y: targetY },
                    useNativeDriver: false,
                    tension: 120,
                    friction: 7,
                  }).start();

                  setPlaced((prev) => {
                    const next = [...prev];
                    next[dropZone.slotIndex!] = option.id;
                    return next;
                  });
                } else {
                  // Invalid drop: not on a slot - FORCE return to bank (position 0,0)
                  // This handles both 'bank' and 'middle' zones
                  Animated.spring(panValues[option.id], {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                    tension: 150,
                    friction: 8,
                  }).start(() => {
                    // Double-check: ensure it's exactly at 0,0
                    panValues[option.id].setValue({ x: 0, y: 0 });
                  });

                  // Remove from slot if it was placed
                  setPlaced((prev) => {
                    const next = [...prev];
                    const slotIndex = next.findIndex((id) => id === option.id);
                    if (slotIndex !== -1) {
                      next[slotIndex] = undefined;
                    }
                    return next;
                  });
                }

                draggingOptionIdRef.current = null;
                setDraggingOptionId(null);
              });
            },
          );
        } else {
          // No ref - fallback to stored initial position
          const originalCenter = optionInitialPositions.current[option.id];
          if (originalCenter) {
            const dropZone = detectDropZone(screenX, screenY);
            if (
              dropZone.zone === "slot" &&
              dropZone.slotIndex !== undefined &&
              dropZone.slotCenter
            ) {
              handleSlotReplacement(dropZone.slotIndex, option.id);
              const targetX = dropZone.slotCenter.x - originalCenter.x;
              const targetY = dropZone.slotCenter.y - originalCenter.y;
              Animated.spring(panValues[option.id], {
                toValue: { x: targetX, y: targetY },
                useNativeDriver: false,
                tension: 120,
                friction: 7,
              }).start();
              setPlaced((prev) => {
                const next = [...prev];
                next[dropZone.slotIndex!] = option.id;
                return next;
              });
            } else {
              Animated.spring(panValues[option.id], {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
                tension: 150,
                friction: 8,
              }).start(() => {
                panValues[option.id].setValue({ x: 0, y: 0 });
              });
              setPlaced((prev) => {
                const next = [...prev];
                const slotIndex = next.findIndex((id) => id === option.id);
                if (slotIndex !== -1) {
                  next[slotIndex] = undefined;
                }
                return next;
              });
            }
          }
          draggingOptionIdRef.current = null;
          setDraggingOptionId(null);
        }
      },
    });
  };

  // Check if the placed sequence matches any of the correct sequences
  const isSequenceCorrect = (placedSeq: (string | undefined)[]): boolean => {
    if (validSequences.length === 0) return false;
    return validSequences.some((seq) => {
      if (placedSeq.length !== seq.length) return false;
      return placedSeq.every((id, i) => id === seq[i]);
    });
  };

  const handleSubmit = () => {
    if (showingExplanation) {
      // Don't call onSubmit again - LessonScreen's button will handle navigation
      // This just resets the internal state (though LessonScreen handles it)
      return;
    } else {
      // Submit and show explanation
      setSubmitted(true);
      const correct = isSequenceCorrect(placed);
      setIsCorrect(correct);
      setShowingExplanation(true);

      // Call onSubmit to trigger bottom sheet in LessonScreen
      const explanation = correct
        ? correctExplanation || ""
        : wrongExplanation || "";
      onSubmit({
        correct,
        placedIds: placed,
        isCorrect: correct,
        explanation,
      });
    }
  };

  // Expose submit handler via ref
  useEffect(() => {
    if (onSubmitTriggerRef) {
      onSubmitTriggerRef.current = handleSubmit;
    }
    return () => {
      if (onSubmitTriggerRef) {
        onSubmitTriggerRef.current = null;
      }
    };
  }, [
    onSubmitTriggerRef,
    showingExplanation,
    placed,
    isCorrect,
    correctExplanation,
    wrongExplanation,
  ]);

  // Notify parent about state changes
  useEffect(() => {
    if (onStateChange) {
      // Can submit if all slots are filled
      const allFilled = placed.every((id) => id !== undefined);
      onStateChange({
        showingExplanation,
        canSubmit: allFilled && !showingExplanation,
      });
    }
  }, [onStateChange, showingExplanation, placed]);

  return (
    <View style={styles.container}>
      <View style={styles.slotsRow}>
        {Array.from({ length: slotsCount }).map((_, i) => {
          const optionId = placed[i];
          const isSlotFilled = optionId !== undefined;

          // Determine if this slot is correct (only show after submission)
          let isSlotCorrect = false;
          if (submitted && isSlotFilled && validSequences.length > 0) {
            // Check if this position in any valid sequence matches
            isSlotCorrect = validSequences.some((seq) => {
              if (seq.length > i) {
                return seq[i] === optionId;
              }
              return false;
            });
          }

          return (
            <View
              key={`slot-${i}`}
              ref={(ref: any) => (slotRefs.current[i] = ref)}
              onLayout={(e) => {
                const layout = e.nativeEvent.layout;
                slotLayouts.current[i] = {
                  x: layout.x,
                  y: layout.y,
                  width: layout.width,
                  height: layout.height,
                };
                // Try to get window coordinates
                const ref = slotRefs.current[i];
                if (ref) {
                  (ref as any).measureInWindow(
                    (x: number, y: number, width: number, height: number) => {
                      slotLayouts.current[i] = { x, y, width, height };
                    },
                  );
                }
              }}
              style={[
                styles.slotCircle,
                submitted &&
                  isSlotFilled &&
                  (isSlotCorrect ? styles.slotCorrect : styles.slotWrong),
              ]}
            />
          );
        })}
      </View>
      <View
        ref={optionsRowRef}
        style={styles.optionsRow}
        onLayout={(e) => {
          const layout = e.nativeEvent.layout;
          // Store layout first
          if (optionsRowRef.current) {
            (optionsRowRef.current as any).measureInWindow(
              (x: number, y: number, width: number, height: number) => {
                bankLayout.current = { x, y, width, height };
              },
            );
          } else {
            // Fallback to relative coordinates
            bankLayout.current = {
              x: layout.x,
              y: layout.y,
              width: layout.width,
              height: layout.height,
            };
          }
        }}
      >
        <View style={styles.optionsInnerWrapper}>
          {options.map((o, index) => {
            const pan = panValues[o.id] || new Animated.ValueXY({ x: 0, y: 0 });
            if (!panValues[o.id]) panValues[o.id] = pan;
            const resp = attachPanResponder(o);
            const isDragging = draggingOptionId === o.id;

            return (
              <React.Fragment key={`${o.id}-${index}`}>
                {/* Shadow/outline placeholder in bank when dragging - rendered in same position */}
                {isDragging && (
                  <View
                    style={[
                      styles.optionShadow,
                      {
                        width:
                          optionOriginalBankLayouts.current[o.id]?.width || 40,
                        height:
                          optionOriginalBankLayouts.current[o.id]?.height ||
                          120,
                      },
                    ]}
                  />
                )}
                <Animated.View
                  ref={(ref: any) => (optionRefs.current[o.id] = ref)}
                  style={[
                    styles.optionCandle,
                    {
                      transform: [{ translateX: pan.x }, { translateY: pan.y }],
                      opacity: isDragging ? 0.8 : 1, // Slightly transparent when dragging
                    },
                  ]}
                  {...resp.panHandlers}
                  onLayout={(e) => {
                    const layout = e.nativeEvent.layout;
                    // Store layout
                    optionLayouts.current[o.id] = {
                      x: layout.x,
                      y: layout.y,
                      width: layout.width,
                      height: layout.height,
                    };

                    // Store original bank layout (only if not already stored)
                    if (!optionOriginalBankLayouts.current[o.id]) {
                      optionOriginalBankLayouts.current[o.id] = {
                        x: layout.x,
                        y: layout.y,
                        width: layout.width,
                        height: layout.height,
                      };
                    }

                    // Try to get window coordinates for initial position
                    if (!optionInitialPositions.current[o.id]) {
                      const ref = optionRefs.current[o.id];
                      if (ref) {
                        (ref as any).measureInWindow(
                          (
                            x: number,
                            y: number,
                            width: number,
                            height: number,
                          ) => {
                            optionInitialPositions.current[o.id] = {
                              x: x + width / 2,
                              y: y + height / 2,
                            };
                          },
                        );
                      } else {
                        // Fallback to layout coordinates (relative to parent)
                        optionInitialPositions.current[o.id] = {
                          x: layout.x + layout.width / 2,
                          y: layout.y + layout.height / 2,
                        };
                      }
                    }
                  }}
                >
                  {renderOptionContent(o, svgCache, parsedCacheRef)}
                </Animated.View>
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  slotsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 14,
  },
  slotCircle: {
    width: 70,
    height: 110,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "transparent",
  },
  slotCorrect: {
    borderColor: "#12B76A",
    backgroundColor: "#F0FDF4",
  },
  slotWrong: {
    borderColor: "#F04438",
    backgroundColor: "#FEF3F2",
  },
  optionsRow: {
    width: "100%",
    marginTop: 4,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsInnerWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  optionCandle: {
    width: 70,
    height: 110, // Match slot height exactly
    alignItems: "center",
    justifyContent: "center",
  },
  optionShadow: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(61, 159, 255, 0.4)",
    borderStyle: "dashed",
    borderRadius: 16,
  },
});
