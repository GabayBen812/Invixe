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
import { useDrillViewportHeight } from "./DrillViewport";
import DrillChoiceLabel from "./DrillChoiceLabel";
import DrillChoiceScrollArea from "./DrillChoiceScrollArea";
import {
  DRILL_MEDIA_STACK_GAP,
  getDrillChoicePlainText,
  getDrillChoiceText,
  needsScrollableChoiceList,
} from "../../utils/drillFitLayout";
import {
  getAlternateSupabaseUrl,
  normalizeSupabaseUrl,
} from "../../utils/supabaseUrl";
import { useLessonTheme } from "../../context/LessonThemeContext";
import PracticeMediaSurface from "./PracticeMediaSurface";
import {
  computeBareChartHeight,
  isLandscapePhotoAsset,
} from "../../utils/graphQuestionMedia";

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
  const { theme, isPractice } = useLessonTheme();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [pngDimensions, setPngDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const drillViewportHeight = useDrillViewportHeight();
  const visibleChoices = choices.filter(
    (c) =>
      getDrillChoicePlainText(c).length > 0 ||
      !!(c as GraphQuestionChoice).pngUrl ||
      !!(c as GraphQuestionChoice).svgPublicUrl ||
      !!(c as GraphQuestionChoice).svgUrl,
  );
  const isYesNo =
    visibleChoices.length === 2 &&
    visibleChoices.every((c) => {
      const t = getDrillChoicePlainText(c).trim();
      return t === "כן" || t === "לא";
    });

  const [pngUri, setPngUri] = useState<string | null>(null);
  const triedAlternatePngRef = useRef(false);

  const activePngUrl = useMemo(() => {
    if (mediaType !== "png") return null;
    return normalizeSupabaseUrl(pngUrl) || pngUrl || null;
  }, [mediaType, pngUrl]);

  useEffect(() => {
    triedAlternatePngRef.current = false;
    setPngUri(activePngUrl);
    setPngDimensions(null);
  }, [activePngUrl]);

  useEffect(() => {
    if (mediaType !== "png" || !pngUri) {
      setPngDimensions(null);
      return;
    }
    Image.getSize(
      pngUri,
      (width, height) => setPngDimensions({ width, height }),
      () => setPngDimensions(null),
    );
  }, [mediaType, pngUri]);

  const isLandscapePhoto = useMemo(() => {
    if (mediaType !== "png" || !pngDimensions) return false;
    return isLandscapePhotoAsset(pngDimensions.width, pngDimensions.height);
  }, [mediaType, pngDimensions]);

  const isBareChart =
    mediaType === "svg" || (mediaType === "png" && !isLandscapePhoto);
  const showEnlargeControl = mediaType === "png" && isLandscapePhoto;

  const layout = useChoiceDrillLayout(
    visibleChoices.length || choices.length,
    { hasMedia: true, gridCols: isYesNo ? 2 : undefined },
  );
  const stackGap = DRILL_MEDIA_STACK_GAP;
  const mediaHeight = useMemo(() => {
    if (!isBareChart) return layout.mediaHeight;

    return computeBareChartHeight(drillViewportHeight, screenHeight, {
      reservedSpace:
        layout.containerPadding * 2 +
        layout.choicesMinHeight +
        stackGap +
        20,
      fraction: isYesNo ? 0.64 : 0.5,
    });
  }, [
    isBareChart,
    layout.mediaHeight,
    layout.containerPadding,
    layout.choicesMinHeight,
    drillViewportHeight,
    screenHeight,
    isYesNo,
    stackGap,
  ]);
  const blockMinHeight = mediaHeight + layout.choicesMinHeight + stackGap + 16;
  const scrollChoices =
    !isYesNo &&
    needsScrollableChoiceList(layout, drillViewportHeight, mediaHeight);

  // Active media - always use the main graph, don't change based on selected choice
  const activeSvgCode = useMemo(() => {
    if (mediaType !== "svg") return undefined;
    return svgCode;
  }, [mediaType, svgCode]);

  const activeSvgUrl = useMemo(() => {
    if (mediaType !== "svg") return undefined;
    return svgPublicUrl || svgUrl;
  }, [mediaType, svgPublicUrl, svgUrl]);

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
          minHeight: scrollChoices ? undefined : blockMinHeight,
        },
        scrollChoices && styles.containerScrollable,
      ]}
    >
      <View
        style={[
          styles.mediaWrapper,
          isBareChart && styles.mediaWrapperBare,
          { flexShrink: 0, height: mediaHeight, overflow: "hidden" },
        ]}
      >
        {isBareChart ? (
          <PracticeMediaSurface style={{ height: "100%", width: "100%" }}>
            <View
              style={[
                styles.mediaContainer,
                styles.mediaContainerBare,
                { height: "100%" },
              ]}
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
          </PracticeMediaSurface>
        ) : (
          <>
            <PracticeMediaSurface style={{ height: mediaHeight, width: "100%" }}>
              <View
                style={[styles.mediaContainer, { height: "100%" }]}
                pointerEvents="none"
              >
                {pngUri ? (
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
            </PracticeMediaSurface>

            <Pressable
              style={styles.fullScreenOverlay}
              onPress={() => setFullScreenOpen(true)}
            >
              <View style={styles.fullScreenIndicator} pointerEvents="none">
                <Text style={styles.fullScreenIcon}>⛶</Text>
                <Text style={styles.fullScreenText}>הקש להגדלה</Text>
              </View>
            </Pressable>
          </>
        )}
      </View>

      {(() => {
        const choiceNodes = visibleChoices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          const choiceText = getDrillChoicePlainText(choice).trim();
          const yesNoBaseColor =
            isPractice && isYesNo && !submitted
              ? choiceText === "כן"
                ? theme.choiceYesBg
                : choiceText === "לא"
                  ? theme.choiceNoBg
                  : theme.choiceBg
              : null;
          const isCorrectChoice = choice.correct;
          const showFeedbackHighlight =
            submitted &&
            ((isSelected && isCorrectChoice) ||
              (isSelected && !isCorrectChoice) ||
              (!isSelected && isCorrectChoice));
          const labelColor = showFeedbackHighlight
            ? "#FFFFFF"
            : submitted
              ? isPractice
                ? theme.choiceDisabledText
                : "#9CA3AF"
              : isSelected
                ? theme.choiceSelectedText
                : yesNoBaseColor
                  ? "#FFFFFF"
                  : theme.choiceText;
          let buttonStyle: any = [styles.choiceButton];

          if (submitted) {
            if (isSelected && isCorrectChoice) {
              buttonStyle = [
                styles.choiceButton,
                { backgroundColor: theme.choiceCorrectBg, borderColor: "transparent" },
              ];
            } else if (isSelected && !isCorrectChoice) {
              buttonStyle = [
                styles.choiceButton,
                { backgroundColor: theme.choiceWrongBg, borderColor: "transparent" },
              ];
            } else if (!isSelected && isCorrectChoice) {
              buttonStyle = [
                styles.choiceButton,
                { backgroundColor: theme.choiceCorrectBg, borderColor: "transparent" },
              ];
            } else {
              buttonStyle = [
                styles.choiceButton,
                styles.choiceButtonDisabled,
                isPractice && { backgroundColor: theme.choiceDisabledBg },
              ];
            }
          } else if (yesNoBaseColor) {
            buttonStyle = [
              styles.choiceButton,
              {
                backgroundColor: yesNoBaseColor,
                borderColor: isSelected ? "rgba(255,255,255,0.9)" : "transparent",
                borderWidth: isSelected ? 2 : 0,
                flex: 1,
                borderRadius: 8,
              },
            ];
          } else if (isYesNo && !isPractice) {
            buttonStyle = [
              styles.choiceButton,
              isSelected ? styles.choiceButtonSelected : styles.choiceButtonYesNoLight,
              { flex: 1 },
            ];
          } else if (isSelected) {
            buttonStyle = [
              styles.choiceButton,
              isPractice
                ? { backgroundColor: theme.choiceSelectedBg, borderColor: "transparent" }
                : styles.choiceButtonSelected,
            ];
          } else if (isPractice) {
            buttonStyle = [
              styles.choiceButton,
              {
                backgroundColor: theme.choiceBg,
                borderColor: theme.choiceBorder,
              },
            ];
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
                isYesNo && styles.choiceButtonYesNo,
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
        });

        const choiceContainerStyle = [
          styles.choicesContainer,
          {
            gap: layout.choiceGap,
            minHeight: scrollChoices || isYesNo ? undefined : layout.choicesMinHeight,
          },
          isYesNo && styles.choicesContainerYesNo,
        ];

        if (scrollChoices) {
          return (
            <DrillChoiceScrollArea gap={layout.choiceGap}>
              {choiceNodes}
            </DrillChoiceScrollArea>
          );
        }

        return <View style={choiceContainerStyle}>{choiceNodes}</View>;
      })()}
      {/* No inline submit button – submit triggered by absolute button in LessonScreen */}

      {/* Full-screen modal — PNG charts only */}
      {showEnlargeControl ? (
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
      ) : null}
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
  containerScrollable: {
    flex: 1,
    minHeight: 0,
    flexShrink: 1,
  },
  mediaWrapper: {
    width: "100%",
    position: "relative",
    zIndex: 100,
  },
  mediaWrapperBare: {
    zIndex: 1,
  },
  mediaContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaContainerBare: {
    paddingHorizontal: 4,
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
  choicesContainerYesNo: {
    flexDirection: "row",
    alignItems: "stretch",
    maxWidth: "100%",
    paddingHorizontal: 8,
    gap: 10,
  },
  choiceButtonYesNo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 46,
    borderRadius: 8,
  },
  choiceButtonYesNoLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    borderWidth: 1.5,
    borderRadius: 8,
    shadowColor: "#0F2233",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  choiceTextWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
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
    shadowColor: "#3F9FFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
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
