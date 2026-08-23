import React, { useState, useEffect, useMemo } from 'react';
import { View, Pressable, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useChoiceDrillLayout } from '../../hooks/useChoiceDrillLayout';
import DrillChoiceLabel from './DrillChoiceLabel';
import DrillChoiceScrollArea from './DrillChoiceScrollArea';
import { useDrillViewportHeight } from './DrillViewport';
import {
  DRILL_MEDIA_STACK_GAP,
  getDrillChoicePlainText,
  needsScrollableChoiceList,
} from '../../utils/drillFitLayout';
import { normalizeSupabaseUrl } from '../../utils/supabaseUrl';
import { useLessonTheme } from '../../context/LessonThemeContext';
import PracticeMediaSurface from './PracticeMediaSurface';

interface Choice {
  id: string;
  text: string;
  label?: string;
  speechbubbleText?: string;
  correct: boolean;
}

interface Props {
  question: string;
  imageSource: any;
  choices: Choice[];
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onSubmit: (result: { 
    correct: boolean; 
    selectedChoiceId: string;
    isCorrect: boolean;
    explanation: string;
  }) => void;
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onStateChange?: (state: { showingExplanation: boolean; canSubmit: boolean }) => void;
}

export default function QuestionWithImage({ 
  imageSource, 
  choices, 
  correctExplanation,
  wrongExplanation,
  onSubmit,
  onSubmitTriggerRef,
  onStateChange
}: Props) {
  const { theme, isPractice } = useLessonTheme();
  const viewportHeight = useDrillViewportHeight();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const resolvedSource = useMemo(() => {
    if (imageSource && typeof imageSource === "object" && imageSource.uri) {
      const normalized = normalizeSupabaseUrl(imageSource.uri);
      return normalized ? { uri: normalized } : null;
    }
    return imageSource;
  }, [imageSource]);

  const visibleChoices = useMemo(
    () => choices.filter((c) => getDrillChoicePlainText(c).length > 0),
    [choices],
  );
  const useGridLayout = (visibleChoices.length || choices.length) > 4;

  // Reset selection/submit when navigating between consecutive questionWithImage steps
  // (same component type — without a remount, state would otherwise leak).
  const contentKey = useMemo(() => {
    const uri =
      resolvedSource && typeof resolvedSource === "object" && resolvedSource.uri
        ? String(resolvedSource.uri)
        : "";
    const choiceIds = visibleChoices.map((c) => c.id).join("|");
    return `${uri}::${choiceIds}`;
  }, [resolvedSource, visibleChoices]);

  useEffect(() => {
    setSelectedChoice(null);
    setSubmitted(false);
    setShowingExplanation(false);
    setImageLoading(true);
    if (onStateChange) {
      onStateChange({ showingExplanation: false, canSubmit: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset when question content changes
  }, [contentKey]);

  const layout = useChoiceDrillLayout(visibleChoices.length || choices.length, {
    hasMedia: true,
    gridCols: useGridLayout ? 2 : 1,
  });

  useEffect(() => {
    if (resolvedSource && typeof resolvedSource === "object" && resolvedSource.uri) {
      Image.prefetch(resolvedSource.uri)
        .then(() => setImageLoading(false))
        .catch(() => setImageLoading(false));
    } else {
      setImageLoading(false);
    }
  }, [resolvedSource]);

  const hasImage =
    resolvedSource &&
    (typeof resolvedSource !== "object" || !!resolvedSource.uri);

  const handleSubmit = () => {
    if (selectedChoice) {
      const selectedChoiceData = choices.find(c => c.id === selectedChoice);
      const correct = selectedChoiceData?.correct || false;
      const explanation = correct ? (correctExplanation || '') : (wrongExplanation || '');
      setSubmitted(true);
      setShowingExplanation(true);
      onSubmit({ 
        correct,
        selectedChoiceId: selectedChoice || '',
        isCorrect: correct,
        explanation
      });
    }
  };

  useEffect(() => {
    if (onSubmitTriggerRef) {
      onSubmitTriggerRef.current = () => {
        if (!showingExplanation && selectedChoice) {
          handleSubmit();
        }
      };
    }
    return () => {
      if (onSubmitTriggerRef) {
        onSubmitTriggerRef.current = null;
      }
    };
  }, [onSubmitTriggerRef, showingExplanation, selectedChoice, correctExplanation, wrongExplanation]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showingExplanation,
        canSubmit: !!selectedChoice && !showingExplanation,
      });
    }
  }, [onStateChange, showingExplanation, selectedChoice]);

  const stackGap = DRILL_MEDIA_STACK_GAP;
  const scrollChoices = needsScrollableChoiceList(
    layout,
    viewportHeight,
    layout.mediaHeight,
  );
  const blockMinHeight =
    layout.mediaHeight + layout.choicesMinHeight + stackGap + 16;

  const choiceNodes = visibleChoices.map((choice) => {
    const isSelected = selectedChoice === choice.id;
    const isCorrectChoice = choice.correct;

    let backgroundColor = isPractice ? theme.choiceBg : "#FFFFFF";
    let textColor = isPractice ? theme.choiceText : "#0D2033";

    if (submitted) {
      if (isSelected && isCorrectChoice) {
        backgroundColor = isPractice ? theme.choiceCorrectBg : "#12B76A";
        textColor = "#FFFFFF";
      } else if (isSelected && !isCorrectChoice) {
        backgroundColor = isPractice ? theme.choiceWrongBg : "#FF6B6B";
        textColor = "#FFFFFF";
      } else if (!isSelected && isCorrectChoice) {
        backgroundColor = isPractice ? theme.choiceCorrectBg : "#12B76A";
        textColor = "#FFFFFF";
      } else {
        backgroundColor = isPractice ? theme.choiceDisabledBg : "#F3F4F6";
        textColor = isPractice ? theme.choiceDisabledText : "#9CA3AF";
      }
    } else if (isSelected) {
      backgroundColor = isPractice ? theme.choiceSelectedBg : "#3372D8";
      textColor = isPractice ? theme.choiceSelectedText : "#FFFFFF";
    }

    return (
      <Pressable
        key={choice.id}
        style={({ pressed }) => [
          styles.choiceButton,
          useGridLayout && styles.choiceButtonGrid,
          {
            backgroundColor,
            paddingVertical: layout.choicePaddingVertical,
            paddingHorizontal: layout.choicePaddingHorizontal,
            marginBottom: 0,
          },
          isSelected && !submitted && styles.choiceButtonSelectedShadow,
          submitted && !isSelected && !isCorrectChoice && styles.choiceButtonDisabled,
          pressed && !submitted && { transform: [{ scale: 0.985 }] },
        ]}
        onPress={() => {
          if (!submitted) {
            setSelectedChoice(choice.id);
          }
        }}
      >
        <View style={styles.choiceTextWrap}>
          <DrillChoiceLabel
            choice={choice}
            color={textColor}
            style={[
              styles.choiceText,
              {
                color: textColor,
                fontSize: layout.choiceFontSize,
                lineHeight: layout.choiceLineHeight,
              },
            ]}
          />
        </View>
      </Pressable>
    );
  });

  return (
    <View
      style={[
        styles.container,
        {
          paddingVertical: layout.containerPadding,
          paddingHorizontal: layout.containerPadding + 8,
          gap: stackGap,
          minHeight: scrollChoices ? undefined : blockMinHeight,
        },
        scrollChoices && styles.containerScrollable,
      ]}
    >
      <PracticeMediaSurface style={{ height: layout.mediaHeight }}>
        <View style={[styles.imageContainer, { height: "100%" }]}>
          {hasImage ? (
            <>
              {imageLoading && (
                <View style={styles.imageLoadingContainer}>
                  <ActivityIndicator size="large" color="#3F9FFF" />
                </View>
              )}
              <Image
                source={resolvedSource}
                style={[styles.image, imageLoading && styles.imageHidden]}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </>
          ) : null}
        </View>
      </PracticeMediaSurface>

      {scrollChoices ? (
        <DrillChoiceScrollArea
          gap={layout.choiceGap}
          contentStyle={useGridLayout ? styles.choicesGrid : undefined}
        >
          {choiceNodes}
        </DrillChoiceScrollArea>
      ) : (
        <View
          style={[
            styles.choicesContainer,
            useGridLayout && styles.choicesGrid,
            { gap: layout.choiceGap, minHeight: layout.choicesMinHeight },
          ]}
        >
          {choiceNodes}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexShrink: 0,
    justifyContent: "flex-start",
  },
  containerScrollable: {
    flex: 1,
    minHeight: 0,
    flexShrink: 1,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageHidden: {
    opacity: 0,
  },
  imageLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choicesContainer: {
    width: '100%',
    flexShrink: 0,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 8,
  },
  choiceButton: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    alignSelf: 'center',
  },
  choiceButtonGrid: {
    width: '46%',
    maxWidth: undefined,
  },
  choiceButtonSelectedShadow: {
    shadowColor: '#3F9FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  choiceTextWrap: {
    width: '100%',
    alignItems: 'center',
  },
  choiceButtonDisabled: {
    opacity: 0.6,
  },
  choiceText: {
    color: '#0D2033',
    fontWeight: '700',
    textAlign: 'center',
  },
});
