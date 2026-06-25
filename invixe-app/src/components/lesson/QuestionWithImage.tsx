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

  const visibleChoices = useMemo(
    () => choices.filter((c) => getDrillChoicePlainText(c).length > 0),
    [choices],
  );
  const layout = useChoiceDrillLayout(visibleChoices.length || choices.length, {
    hasMedia: true,
  });

  const resolvedSource = useMemo(() => {
    if (imageSource && typeof imageSource === 'object' && imageSource.uri) {
      const normalized = normalizeSupabaseUrl(imageSource.uri);
      return normalized ? { uri: normalized } : imageSource;
    }
    return imageSource;
  }, [imageSource]);

  useEffect(() => {
    if (resolvedSource && typeof resolvedSource === 'object' && resolvedSource.uri) {
      Image.prefetch(resolvedSource.uri)
        .then(() => setImageLoading(false))
        .catch(() => setImageLoading(false));
    } else {
      setImageLoading(false);
    }
  }, [resolvedSource]);

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
                ? "#FFFFFF"
                : isPractice
                  ? theme.choiceText
                  : "#374151";
          let buttonStyle: object[] = [
            styles.choiceButton,
            isPractice && {
              backgroundColor: theme.choiceBg,
              borderColor: theme.choiceBorder,
            },
          ];
          let textStyle: object[] = [
            styles.choiceText,
            isPractice && { color: theme.choiceText },
            {
              fontSize: layout.choiceFontSize,
              lineHeight: layout.choiceLineHeight,
            },
          ];

          if (submitted) {
            if (isSelected && isCorrectChoice) {
              buttonStyle = isPractice
                ? [
                    styles.choiceButton,
                    { backgroundColor: theme.choiceCorrectBg, borderColor: "transparent" },
                  ]
                : [styles.choiceButton, styles.choiceButtonCorrect];
              textStyle = [styles.choiceText, styles.choiceTextCorrect, { fontSize: layout.choiceFontSize }];
            } else if (isSelected && !isCorrectChoice) {
              buttonStyle = isPractice
                ? [
                    styles.choiceButton,
                    { backgroundColor: theme.choiceWrongBg, borderColor: "transparent" },
                  ]
                : [styles.choiceButton, styles.choiceButtonWrong];
              textStyle = [styles.choiceText, styles.choiceTextWrong, { fontSize: layout.choiceFontSize }];
            } else if (!isSelected && isCorrectChoice) {
              buttonStyle = isPractice
                ? [
                    styles.choiceButton,
                    { backgroundColor: theme.choiceCorrectBg, borderColor: "transparent" },
                  ]
                : [styles.choiceButton, styles.choiceButtonCorrect];
              textStyle = [styles.choiceText, styles.choiceTextCorrect, { fontSize: layout.choiceFontSize }];
            } else {
              buttonStyle = isPractice
                ? [
                    styles.choiceButton,
                    { backgroundColor: theme.choiceDisabledBg, borderColor: "transparent" },
                  ]
                : [styles.choiceButton, styles.choiceButtonDisabled];
              textStyle = [
                styles.choiceText,
                isPractice ? { color: theme.choiceDisabledText } : styles.choiceTextDisabled,
                { fontSize: layout.choiceFontSize },
              ];
            }
          } else if (isSelected) {
            buttonStyle = isPractice
              ? [
                  styles.choiceButton,
                  { backgroundColor: theme.choiceSelectedBg, borderColor: "transparent" },
                ]
              : [styles.choiceButton, styles.choiceButtonSelected];
            textStyle = [
              styles.choiceText,
              isPractice ? { color: theme.choiceSelectedText } : styles.choiceTextSelected,
              { fontSize: layout.choiceFontSize },
            ];
          }

          return (
            <Pressable
              key={choice.id}
              style={[
                ...buttonStyle,
                {
                  paddingVertical: layout.choicePaddingVertical,
                  paddingHorizontal: layout.choicePaddingHorizontal,
                },
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
                  color={labelColor}
                  style={textStyle}
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
        </View>
      </PracticeMediaSurface>

      {scrollChoices ? (
        <DrillChoiceScrollArea gap={layout.choiceGap}>
          {choiceNodes}
        </DrillChoiceScrollArea>
      ) : (
        <View
          style={[
            styles.choicesContainer,
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
  choiceButton: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    alignSelf: 'center',
  },
  choiceTextWrap: {
    width: '100%',
    alignItems: 'center',
  },
  choiceButtonSelected: {
    backgroundColor: '#3372D8',
    shadowColor: '#3F9FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  choiceButtonCorrect: {
    backgroundColor: '#12B76A',
  },
  choiceButtonWrong: {
    backgroundColor: '#FF6B6B',
  },
  choiceButtonDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  choiceText: {
    color: '#0D2033',
    fontWeight: '700',
    textAlign: 'center',
  },
  choiceTextSelected: {
    color: '#FFFFFF',
  },
  choiceTextCorrect: {
    color: '#FFFFFF',
  },
  choiceTextWrong: {
    color: '#FFFFFF',
  },
  choiceTextDisabled: {
    color: '#9CA3AF',
  },
});
