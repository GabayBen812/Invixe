import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Modal,
  useWindowDimensions,
} from "react-native";
import { SvgUri } from "react-native-svg";
import { parseSVGCode } from "../../utils/svgParser";
import { fetchRemoteText } from "../../utils/remoteAssetCache";
import { useChoiceDrillLayout } from "../../hooks/useChoiceDrillLayout";
import DrillChoiceLabel from "./DrillChoiceLabel";
import {
  DRILL_MEDIA_STACK_GAP,
  getDrillChoicePlainText,
  getDrillChoiceText,
} from "../../utils/drillFitLayout";
import {
  getAlternateSupabaseUrl,
  normalizeSupabaseUrl,
} from "../../utils/supabaseUrl";

export interface GraphQuestionChoice {
  id: string;
  text: string;
  correct?: boolean;
  speechbubbleText?: string;
  svgCode?: string;
  svgPublicUrl?: string | null;
  pngUrl?: string | null;
}

type MediaType = "svg" | "png";

interface Props {
  mediaType: MediaType;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string | null;
  pngUrl?: string | null;
  choices: GraphQuestionChoice[];
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onStateChange?: (state: {
    showingExplanation: boolean;
    canSubmit: boolean;
  }) => void;
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onSubmit: (result: {
    correct: boolean;
    selectedChoiceId: string;
    isCorrect: boolean;
    explanation: string;
  }) => void;
}

export default function GraphQuestionDrill({
  mediaType,
  svgCode,
  svgUrl,
  svgPublicUrl,
  pngUrl,
  choices,
  submitText = "בדוק",
  correctExplanation,
  wrongExplanation,
  onStateChange,
  onSubmitTriggerRef,
  onSubmit,
}: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const visibleChoices = choices.filter(
    (c) =>
      getDrillChoicePlainText(c).length > 0 ||
      !!(c as GraphQuestionChoice).pngUrl ||
      !!(c as GraphQuestionChoice).svgPublicUrl ||
      !!(c as GraphQuestionChoice).svgUrl,
  );
  const layout = useChoiceDrillLayout(
    visibleChoices.length || choices.length,
    { hasMedia: true },
  );
  const stackGap = DRILL_MEDIA_STACK_GAP;
  const blockMinHeight =
    layout.mediaHeight + layout.choicesMinHeight + stackGap + 16;

  // Active media - always use the main graph, don't change based on selected choice
  const activeSvgCode = useMemo(() => {
    if (mediaType !== "svg") return undefined;
    return svgCode;
  }, [mediaType, svgCode]);

  const activeSvgUrl = useMemo(() => {
    if (mediaType !== "svg") return undefined;
    return svgPublicUrl || svgUrl;
  }, [mediaType, svgPublicUrl, svgUrl]);

  const [pngUri, setPngUri] = useState<string | null>(null);
  const triedAlternatePngRef = useRef(false);

  const activePngUrl = useMemo(() => {
    if (mediaType !== "png") return null;
    return normalizeSupabaseUrl(pngUrl) || pngUrl || null;
  }, [mediaType, pngUrl]);

  useEffect(() => {
    triedAlternatePngRef.current = false;
    setPngUri(activePngUrl);
  }, [activePngUrl]);

  // Fetch SVG text when only URL is available
  const [svgCache, setSvgCache] = useState<string | null>(null);

  useEffect(() => {
    if (mediaType !== "svg") return;
    const codeToUse = activeSvgCode;
    const urlToUse = !codeToUse ? activeSvgUrl : undefined;
    if (!urlToUse) {
      setSvgCache(null);
      return;
    }

    let cancelled = false;
    const fetchSVG = async () => {
      try {
        const text = await fetchRemoteText(urlToUse);
        if (!cancelled) setSvgCache(text);
      } catch {
        if (!cancelled) setSvgCache(null);
      }
    };
    fetchSVG();
    return () => {
      cancelled = true;
    };
  }, [mediaType, activeSvgCode, activeSvgUrl]);

  const handleSubmit = () => {
    if (!selectedChoice) return;
    const selectedChoiceData = choices.find((c) => c.id === selectedChoice);
    const correct = selectedChoiceData?.correct || false;

    setSubmitted(true);
    setIsCorrect(correct);
    setShowingExplanation(true);

    const explanation = correct
      ? correctExplanation || ""
      : wrongExplanation || "";
    onSubmit({
      correct,
      selectedChoiceId: selectedChoice,
      isCorrect: correct,
      explanation,
    });
  };

  // Expose submit handler for absolute button
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
    handleSubmit,
    selectedChoice,
    choices,
    correctExplanation,
    wrongExplanation,
  ]);

  // Notify parent about state (used to enable/disable absolute button)
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showingExplanation,
        canSubmit: !!selectedChoice && !showingExplanation,
      });
    }
  }, [onStateChange, showingExplanation, selectedChoice]);

  // Parse SVG for rendering
  const parsedSVG = useMemo(() => {
    if (mediaType !== "svg") return null;
    const code = activeSvgCode || svgCache;
    if (!code) return null;
    return parseSVGCode(code);
  }, [mediaType, activeSvgCode, svgCache]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingVertical: layout.containerPadding,
          paddingHorizontal: layout.containerPadding + 4,
          gap: stackGap,
          minHeight: blockMinHeight,
        },
      ]}
    >
      <View style={[styles.mediaWrapper, { flexShrink: 0 }]}>
        <View
          style={[styles.mediaContainer, { height: layout.mediaHeight }]}
          pointerEvents="none"
        >
          {mediaType === "svg" ? (
            parsedSVG ? (
              <View style={styles.svgContainer}>{parsedSVG}</View>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Text style={styles.mediaPlaceholderText}>SVG</Text>
              </View>
            )
          ) : pngUri ? (
            <Image
              source={{ uri: pngUri } as any}
              style={styles.pngImage}
              resizeMode="contain"
              onError={() => {
                if (!activePngUrl || triedAlternatePngRef.current) return;
                const alternate = getAlternateSupabaseUrl(activePngUrl);
                if (alternate) {
                  triedAlternatePngRef.current = true;
                  setPngUri(alternate);
                }
              }}
            />
          ) : (
            <View style={styles.mediaPlaceholder}>
              <Text style={styles.mediaPlaceholderText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Clickable overlay for fullscreen */}
        <Pressable
          style={styles.fullScreenOverlay}
          onPress={() => {
            console.log("Fullscreen pressed!");
            setFullScreenOpen(true);
          }}
        >
          {/* Fullscreen indicator */}
          <View style={styles.fullScreenIndicator} pointerEvents="none">
            <Text style={styles.fullScreenIcon}>⛶</Text>
            <Text style={styles.fullScreenText}>הקש להגדלה</Text>
          </View>
        </Pressable>
      </View>

      <View
        style={[
          styles.choicesContainer,
          { gap: layout.choiceGap, minHeight: layout.choicesMinHeight },
        ]}
      >
        {visibleChoices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          const labelColor =
            submitted || isSelected ? "#FFFFFF" : "#374151";
          const isCorrectChoice = choice.correct;
          let buttonStyle: any = styles.choiceButton;

          if (submitted) {
            if (isSelected && isCorrectChoice) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonCorrect];
            } else if (isSelected && !isCorrectChoice) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonWrong];
            } else if (!isSelected && isCorrectChoice) {
              buttonStyle = [styles.choiceButton, styles.choiceButtonCorrect];
            } else {
              buttonStyle = [styles.choiceButton, styles.choiceButtonDisabled];
            }
          } else if (isSelected) {
            buttonStyle = [styles.choiceButton, styles.choiceButtonSelected];
          }

          return (
            <Pressable
              key={choice.id}
              style={[
                buttonStyle,
                {
                  paddingVertical: layout.choicePaddingVertical,
                  paddingHorizontal: layout.choicePaddingHorizontal,
                  marginBottom: 0,
                },
              ]}
              onPress={() => {
                if (!submitted) {
                  setSelectedChoice(choice.id);
                }
              }}
            >
              <View style={styles.choiceTextWrap}>
                {getDrillChoicePlainText(choice) ? (
                  <DrillChoiceLabel
                    choice={choice}
                    color={labelColor}
                    style={[
                      styles.choiceText,
                      {
                        fontSize: layout.choiceFontSize,
                        lineHeight: layout.choiceLineHeight,
                      },
                      (submitted || isSelected) && styles.choiceTextSelected,
                    ]}
                  />
                ) : (() => {
                  const mediaUrl =
                    normalizeSupabaseUrl(choice.pngUrl) ||
                    choice.pngUrl ||
                    normalizeSupabaseUrl(choice.svgPublicUrl) ||
                    choice.svgPublicUrl ||
                    choice.svgUrl;
                  if (!mediaUrl) {
                    const fallback = getDrillChoiceText(choice);
                    return fallback ? (
                      <Text
                        style={[
                          styles.choiceText,
                          { color: labelColor, fontSize: layout.choiceFontSize },
                        ]}
                      >
                        {fallback.replace(/<[^>]+>/g, " ").trim()}
                      </Text>
                    ) : null;
                  }
                  const mediaW = Math.min(screenWidth * 0.38, 160);
                  const mediaH = Math.max(44, layout.choiceLineHeight * 2);
                  if (choice.pngUrl || mediaUrl.includes(".png")) {
                    return (
                      <Image
                        source={{ uri: mediaUrl }}
                        style={{ width: mediaW, height: mediaH }}
                        resizeMode="contain"
                      />
                    );
                  }
                  return (
                    <SvgUri
                      uri={mediaUrl}
                      width={mediaW}
                      height={mediaH}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  );
                })()}
              </View>
            </Pressable>
          );
        })}
      </View>
      {/* No inline submit button – submit triggered by absolute button in LessonScreen */}

      {/* Full-screen modal */}
      <Modal
        visible={fullScreenOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenOpen(false)}
      >
        <View style={styles.fullScreenContainer}>
          <Pressable
            style={styles.fullScreenBackdrop}
            onPress={() => setFullScreenOpen(false)}
          />
          <View style={styles.fullScreenContent}>
            {/* Close button */}
            <Pressable
              style={styles.closeButton}
              onPress={() => setFullScreenOpen(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>

            {/* Full-screen image/SVG */}
            {mediaType === "png" && pngUri ? (
              <Image
                source={{ uri: pngUri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            ) : parsedSVG ? (
              <View style={styles.fullScreenSvgContainer}>{parsedSVG}</View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexShrink: 0,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  mediaWrapper: {
    width: "100%",
    position: "relative",
    zIndex: 100,
  },
  mediaContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 101,
  },
  mediaPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#D4DDEE",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaPlaceholderText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 16,
  },
  pngImage: {
    width: "100%",
    height: "100%",
  },
  svgContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  choicesContainer: {
    width: "100%",
    maxWidth: 480,
    flexShrink: 0,
    alignSelf: "center",
  },
  choiceTextWrap: {
    width: "100%",
    alignItems: "center",
  },
  choiceButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  choiceButtonSelected: {
    borderColor: "#3372D8",
    backgroundColor: "#3372D8",
  },
  choiceButtonCorrect: {
    borderColor: "#12B76A",
    backgroundColor: "#12B76A",
  },
  choiceButtonWrong: {
    borderColor: "#D92D20",
    backgroundColor: "#FEE4E2",
  },
  choiceButtonDisabled: {
    opacity: 0.6,
  },
  choiceText: {
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
  choiceTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  fullScreenIndicator: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(63, 159, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 102,
  },
  fullScreenIcon: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  fullScreenText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "NotoSansHebrew",
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  fullScreenContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  fullScreenSvgContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
