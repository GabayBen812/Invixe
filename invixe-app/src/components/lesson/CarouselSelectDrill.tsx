import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { parseSVGCode } from '../../utils/svgParser';
import { fetchRemoteText } from '../../utils/remoteAssetCache';
import { useLessonTheme } from '../../context/LessonThemeContext';
import { normalizeSupabaseUrl } from '../../utils/supabaseUrl';

export interface CarouselItem {
  id: string;
  imageSource?: any;
  imageKey?: string;
  label?: string;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string;
  svgPath?: string;
}

interface Props {
  items: CarouselItem[];
  correctId: string;
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onSubmit: (payload: { 
    correct: boolean; 
    selectedId: string; 
    isCorrect: boolean;
    explanation: string;
  }) => void;
  /**
   * When provided, allows the parent screen to trigger submit programmatically
   * so we can reuse a single global "continue" button for all drills.
   */
  onSubmitTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onRetryTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onStateChange?: (state: {
    submitted: boolean;
    showingFeedback: boolean;
    isCorrect: boolean;
  }) => void;
  /**
   * Whether to render the local submit button inside the drill.
   * For in‑app usage we hide it and use the global button instead.
   */
  showSubmitButton?: boolean;
}

export default function CarouselSelectDrill({ 
  items, 
  correctId, 
  submitText = 'אישור', 
  correctExplanation, 
  wrongExplanation, 
  onSubmit,
  onSubmitTriggerRef,
  onRetryTriggerRef,
  onStateChange,
  showSubmitButton = true,
}: Props) {
  const { theme, isPractice } = useLessonTheme();
  const [index, setIndex] = useState(0);
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const parsedCacheRef = useRef<Record<string, React.ReactElement>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const normalizedItems = useMemo(() => items.length > 0 ? items : [], [items]);
  const selected = normalizedItems[index] || normalizedItems[0];
  const itemAssetKey = useMemo(
    () =>
      normalizedItems
        .map((i) => `${i.id}:${i.svgPublicUrl || i.svgUrl || i.svgCode || i.imageKey || ''}`)
        .join('|'),
    [normalizedItems],
  );

  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;
  const lastNotifiedStateRef = useRef({
    submitted: false,
    showingFeedback: false,
    isCorrect: false,
  });

  // Fetch SVGs from URLs
  useEffect(() => {
    const fetchSVGs = async () => {
      const promises = normalizedItems.map(async (item) => {
        if (item.svgPublicUrl && !svgCache[item.id]) {
          try {
            const text = await fetchRemoteText(item.svgPublicUrl);
            setSvgCache(prev => ({ ...prev, [item.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${item.id}:`, e);
          }
        } else if (item.svgUrl && !svgCache[item.id]) {
          try {
            const text = await fetchRemoteText(item.svgUrl);
            setSvgCache(prev => ({ ...prev, [item.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${item.id}:`, e);
          }
        }
      });
      await Promise.all(promises);
    };
    fetchSVGs();
  }, [itemAssetKey]);

  const renderItemContent = (item: CarouselItem) => {
    const remoteUrl = normalizeSupabaseUrl(item.svgPublicUrl || item.svgUrl || '') ||
      item.svgPublicUrl ||
      item.svgUrl;

    // Priority: cached SVG text, inline svgCode, then live URL via SvgUri
    let svgCodeToParse: string | undefined;

    if (item.svgPublicUrl && svgCache[item.id]) {
      svgCodeToParse = svgCache[item.id];
    } else if (item.svgCode) {
      svgCodeToParse = item.svgCode;
    } else if (item.svgUrl && svgCache[item.id]) {
      svgCodeToParse = svgCache[item.id];
    }

    if (svgCodeToParse) {
      const cacheKey = `${item.id}-${svgCodeToParse.substring(0, 50)}`;
      if (parsedCacheRef.current[cacheKey]) {
        return (
          <View style={styles.itemMediaFrame}>
            {parsedCacheRef.current[cacheKey]}
          </View>
        );
      }

      const parsedSVG = parseSVGCode(svgCodeToParse);
      if (parsedSVG) {
        parsedCacheRef.current[cacheKey] = parsedSVG;
        return <View style={styles.itemMediaFrame}>{parsedSVG}</View>;
      }
    }

    if (remoteUrl) {
      return (
        <View style={styles.itemMediaFrame}>
          <SvgUri
            uri={remoteUrl}
            width={90}
            height={140}
            preserveAspectRatio="xMidYMid meet"
          />
        </View>
      );
    }

    if (item.imageSource) {
      return <Image source={item.imageSource} style={styles.image} />;
    }

    return (
      <View style={styles.itemMediaFrame}>
        <ActivityIndicator size="small" color="#3372D8" />
      </View>
    );
  };

  const goLeft = () => {
    if (submitted) return; // Disable navigation after submit
    setIndex(prev => (prev - 1 + normalizedItems.length) % normalizedItems.length);
  };
  const goRight = () => {
    if (submitted) return; // Disable navigation after submit
    setIndex(prev => (prev + 1) % normalizedItems.length);
  };

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    const current = normalizedItems[index] || normalizedItems[0];
    const correct = current?.id === correctId;
    setSubmitted(true);
    setIsCorrect(correct);
    setShowingExplanation(true);
  }, [submitted, normalizedItems, index, correctId]);

  const handleContinue = useCallback(() => {
    const current = normalizedItems[index] || normalizedItems[0];
    const correct = current?.id === correctId;
    const explanation = correct ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({
      correct,
      selectedId: current?.id,
      isCorrect: correct,
      explanation,
    });
  }, [normalizedItems, index, correctId, correctExplanation, wrongExplanation, onSubmit]);

  const handleTryAgain = useCallback(() => {
    setSubmitted(false);
    setShowingExplanation(false);
    setIsCorrect(false);
  }, []);

  const submitOnce = useCallback(() => {
    if (showingExplanation) {
      handleContinue();
    } else {
      handleSubmit();
    }
  }, [showingExplanation, handleContinue, handleSubmit]);

  useEffect(() => {
    const next = {
      submitted,
      showingFeedback: submitted && showingExplanation,
      isCorrect,
    };
    const prev = lastNotifiedStateRef.current;
    if (
      prev.submitted === next.submitted &&
      prev.showingFeedback === next.showingFeedback &&
      prev.isCorrect === next.isCorrect
    ) {
      return;
    }
    lastNotifiedStateRef.current = next;
    onStateChangeRef.current?.(next);
  }, [submitted, showingExplanation, isCorrect]);

  // Expose programmatic submit trigger for the shared global button
  useEffect(() => {
    if (!onSubmitTriggerRef) return;
    onSubmitTriggerRef.current = submitOnce;
    return () => {
      onSubmitTriggerRef.current = null;
    };
  }, [onSubmitTriggerRef, submitOnce]);

  useEffect(() => {
    if (!onRetryTriggerRef) return;
    onRetryTriggerRef.current = handleTryAgain;
    return () => {
      onRetryTriggerRef.current = null;
    };
  }, [onRetryTriggerRef, handleTryAgain]);

  if (normalizedItems.length === 0) return null;

  // Determine card background color based on state
  const cardBgColor = submitted
    ? isCorrect
      ? theme.choiceCorrectBg
      : theme.choiceWrongBg
    : isPractice
      ? theme.mediaSurfaceBg
      : '#EAF3FF';

  return (
    <View style={styles.container}>
      <View style={styles.carouselRow}>
        <Pressable 
          onPress={goLeft} 
          style={[
            styles.arrowButton,
            isPractice && styles.arrowButtonPractice,
            styles.arrowLeft,
            submitted && styles.arrowDisabled
          ]} 
          hitSlop={12}
          disabled={submitted}
        >
          <Text
            style={[
              styles.arrowText,
              isPractice && { color: '#FFFFFF' },
              submitted && styles.arrowTextDisabled,
            ]}
          >
            ‹
          </Text>
        </Pressable>
        <View
          style={[
            styles.centerCard,
            { backgroundColor: cardBgColor },
            isPractice && !submitted && {
              borderWidth: 1,
              borderColor: theme.mediaSurfaceBorder,
            },
          ]}
        >
          {/* Correct/Wrong indicator badge */}
          {submitted && (
            <View style={styles.feedbackBadge}>
              <Text style={styles.feedbackText}>
                {isCorrect ? '✓ נכון' : '✗ שגוי'}
              </Text>
            </View>
          )}
          {selected ? renderItemContent(selected) : null}
          {selected?.label ? (
            <Text style={[styles.label, submitted && styles.labelLight]}>{selected.label}</Text>
          ) : null}
        </View>
        <Pressable 
          onPress={goRight} 
          style={[
            styles.arrowButton,
            isPractice && styles.arrowButtonPractice,
            styles.arrowRight,
            submitted && styles.arrowDisabled
          ]} 
          hitSlop={12}
          disabled={submitted}
        >
          <Text
            style={[
              styles.arrowText,
              isPractice && { color: '#FFFFFF' },
              submitted && styles.arrowTextDisabled,
            ]}
          >
            ›
          </Text>
        </Pressable>
      </View>
      {showSubmitButton && (
        <View style={styles.localActions}>
          {showingExplanation && !isCorrect ? (
            <>
              <Pressable style={styles.tryAgainButton} onPress={handleTryAgain}>
                <Text style={styles.tryAgainButtonText}>נסה שוב</Text>
              </Pressable>
              <Pressable style={styles.submitButton} onPress={handleContinue}>
                <Text style={styles.submitText}>המשך</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[
                styles.submitButton,
                isPractice && { backgroundColor: theme.confirmButtonBg },
              ]}
              onPress={submitOnce}
            >
              <Text style={styles.submitText}>
                {showingExplanation ? 'המשך' : submitText}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  arrowButtonPractice: {
    backgroundColor: '#333333',
  },
  arrowDisabled: {
    opacity: 0.4,
  },
  arrowLeft: {},
  arrowRight: {},
  arrowText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0D2033',
  },
  arrowTextDisabled: {
    color: '#999999',
  },
  centerCard: {
    width: 210,
    height: 210,
    borderRadius: 120,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemMediaFrame: {
    width: 90,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 90,
    height: 140,
    resizeMode: 'contain',
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#0D2033',
  },
  labelLight: {
    color: '#FFFFFF',
  },
  feedbackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D2033',
  },
  localActions: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  submitButton: {
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    minWidth: 200,
  },
  tryAgainButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    minWidth: 200,
    borderWidth: 2,
    borderColor: '#3372D8',
  },
  tryAgainButtonText: {
    color: '#3372D8',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});


