import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { parseSVGCode } from '../../utils/svgParser';

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
  showSubmitButton = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const parsedCacheRef = useRef<Record<string, React.ReactElement>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const normalizedItems = useMemo(() => items.length > 0 ? items : [], [items]);
  const selected = normalizedItems[index] || normalizedItems[0];

  // Fetch SVGs from URLs
  useEffect(() => {
    const fetchSVGs = async () => {
      const promises = normalizedItems.map(async (item) => {
        if (item.svgPublicUrl && !svgCache[item.id]) {
          try {
            const response = await fetch(item.svgPublicUrl);
            const text = await response.text();
            setSvgCache(prev => ({ ...prev, [item.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${item.id}:`, e);
          }
        } else if (item.svgUrl && !svgCache[item.id]) {
          try {
            const response = await fetch(item.svgUrl);
            const text = await response.text();
            setSvgCache(prev => ({ ...prev, [item.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${item.id}:`, e);
          }
        }
      });
      await Promise.all(promises);
    };
    fetchSVGs();
  }, [normalizedItems.map(i => i.svgPublicUrl || i.svgUrl || i.id).join(',')]);

  const renderItemContent = (item: CarouselItem) => {
    // Priority: 1) svgPublicUrl (from cache), 2) svgCode, 3) svgUrl (from cache), 4) imageSource/imageKey
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
          <View style={{ width: 90, height: 140, alignItems: 'center', justifyContent: 'center' }}>
            {parsedCacheRef.current[cacheKey]}
          </View>
        );
      }
      
      const parsedSVG = parseSVGCode(svgCodeToParse);
      if (parsedSVG) {
        parsedCacheRef.current[cacheKey] = parsedSVG;
        return (
          <View style={{ width: 90, height: 140, alignItems: 'center', justifyContent: 'center' }}>
            {parsedSVG}
          </View>
        );
      }
    }
    
    // Fallback to imageSource/imageKey
    if (item.imageSource) {
      return <Image source={item.imageSource} style={styles.image} />;
    }
    
    return null;
  };

  const goLeft = () => {
    if (submitted) return; // Disable navigation after submit
    setIndex(prev => (prev - 1 + normalizedItems.length) % normalizedItems.length);
  };
  const goRight = () => {
    if (submitted) return; // Disable navigation after submit
    setIndex(prev => (prev + 1) % normalizedItems.length);
  };

  const handleSubmit = () => {
    if (submitted) return;
    const correct = selected?.id === correctId;
    setSubmitted(true);
    setIsCorrect(correct);
    setShowingExplanation(true);
  };

  const handleContinue = () => {
    const correct = selected?.id === correctId;
    const explanation = correct ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({ 
      correct, 
      selectedId: selected?.id, 
      isCorrect: correct,
      explanation
    });
  };

  const submitOnce = showingExplanation ? handleContinue : handleSubmit;

  // Expose programmatic submit trigger for the shared global button
  useEffect(() => {
    if (!onSubmitTriggerRef) return;
    onSubmitTriggerRef.current = submitOnce;
  }, [onSubmitTriggerRef, submitOnce, selected, correctId, correctExplanation, wrongExplanation, submitted, showingExplanation]);

  if (normalizedItems.length === 0) return null;

  // Determine card background color based on state
  const cardBgColor = submitted
    ? (isCorrect ? '#12B76A' : '#D92D20') // Green if correct, red if wrong
    : '#EAF3FF'; // Default light blue

  return (
    <View style={styles.container}>
      <View style={styles.carouselRow}>
        <Pressable 
          onPress={goLeft} 
          style={[
            styles.arrowButton, 
            styles.arrowLeft,
            submitted && styles.arrowDisabled
          ]} 
          hitSlop={12}
          disabled={submitted}
        >
          <Text style={[styles.arrowText, submitted && styles.arrowTextDisabled]}>‹</Text>
        </Pressable>
        <View style={[styles.centerCard, { backgroundColor: cardBgColor }]}>
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
            styles.arrowRight,
            submitted && styles.arrowDisabled
          ]} 
          hitSlop={12}
          disabled={submitted}
        >
          <Text style={[styles.arrowText, submitted && styles.arrowTextDisabled]}>›</Text>
        </Pressable>
      </View>
      {showSubmitButton && (
        <Pressable style={styles.submitButton} onPress={submitOnce}>
          <Text style={styles.submitText}>
            {showingExplanation ? 'המשך' : submitText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
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
  submitButton: {
    marginTop: 18,
    backgroundColor: '#3F9FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});


