import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, PanResponder } from 'react-native';
import { BullishCandleSVG, BearishCandleSVG, DojiCandleSVG } from './CandlestickSVGs';
import { DragonflyDoji, InvertedHammerNew, RegularDoji, ShootingStar, Hammer, BullishEngulfing, BearishEngulfing } from '../../assets/Candels';
import { parseSVGCode } from '../../utils/svgParser';

type CandleKey = 'bullish' | 'bearish' | 'doji' | 'hammer' | 'invertedHammerNew' | 'dragonflyDoji' | 'regularDoji' | 'bullishEngulfing' | 'bearishEngulfing' | 'shootingStar';

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
}

const CandleByKey = ({ keyName }: { keyName: CandleKey }) => {
  switch (keyName) {
    case 'bullish':
      return <BullishCandleSVG width={36} height={110} />;
    case 'bearish':
      return <BearishCandleSVG width={36} height={110} />;
    case 'doji':
      return <DojiCandleSVG width={40} height={110} />;
    case 'hammer':
      return <Hammer width={40} height={120} />;
    case 'invertedHammerNew':
      return <InvertedHammerNew width={40} height={120} />;
    case 'dragonflyDoji':
      return <DragonflyDoji width={40} height={110} />;
    case 'regularDoji':
      return <RegularDoji width={40} height={110} />;
    case 'bullishEngulfing':
      return <BullishEngulfing width={110} height={110} />;
    case 'bearishEngulfing':
      return <BearishEngulfing width={110} height={110} />;
    case 'shootingStar':
      return <ShootingStar width={40} height={120} />;
    default:
      return null;
  }
};

const renderOptionContent = (option: SequenceOption, svgCache: Record<string, string>, parsedCacheRef: React.MutableRefObject<Record<string, React.ReactElement>>) => {
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
    if (parsedCacheRef.current[cacheKey]) {
      return (
        <View style={{ width: 40, height: 120, alignItems: 'center', justifyContent: 'center' }}>
          {parsedCacheRef.current[cacheKey]}
        </View>
      );
    }
    
    const parsedSVG = parseSVGCode(svgCodeToParse);
    if (parsedSVG) {
      parsedCacheRef.current[cacheKey] = parsedSVG;
      return (
        <View style={{ width: 40, height: 120, alignItems: 'center', justifyContent: 'center' }}>
          {parsedSVG}
        </View>
      );
    }
  }
  
  // Fallback to candleKey
  return <CandleByKey keyName={option.candleKey} />;
};

export default function SequenceBuildDrill({ slotsCount, options, correctSequence, correctSequences, submitText = 'אישור', correctExplanation, wrongExplanation, onSubmit }: Props) {
  // Support both old format (correctSequence) and new format (correctSequences)
  // If correctSequence exists, convert it to correctSequences for backward compatibility
  const validSequences: string[][] = correctSequences || (correctSequence ? [correctSequence] : []);
  const [placed, setPlaced] = useState<(string | undefined)[]>(Array(slotsCount).fill(undefined));
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const parsedCacheRef = useRef<Record<string, React.ReactElement>>({});
  const slotLayouts = useRef<{ x: number; y: number; width: number; height: number }[]>([]);
  const panValues = useRef<Record<string, Animated.ValueXY>>({}).current;

  // Fetch SVGs from URLs
  useEffect(() => {
    const fetchSVGs = async () => {
      const promises = options.map(async (option) => {
        if (option.svgPublicUrl && !svgCache[option.id]) {
          try {
            const response = await fetch(option.svgPublicUrl);
            const text = await response.text();
            setSvgCache(prev => ({ ...prev, [option.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${option.id}:`, e);
          }
        } else if (option.svgUrl && !svgCache[option.id]) {
          try {
            const response = await fetch(option.svgUrl);
            const text = await response.text();
            setSvgCache(prev => ({ ...prev, [option.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${option.id}:`, e);
          }
        }
      });
      await Promise.all(promises);
    };
    fetchSVGs();
  }, [options.map(o => o.svgPublicUrl || o.svgUrl || o.id).join(',')]);

  const attachPanResponder = (option: SequenceOption) => {
    if (!panValues[option.id]) panValues[option.id] = new Animated.ValueXY({ x: 0, y: 0 });
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // @ts-ignore
        panValues[option.id].setOffset({ x: panValues[option.id].x._value, y: panValues[option.id].y._value });
        panValues[option.id].setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: panValues[option.id].x, dy: panValues[option.id].y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        panValues[option.id].flattenOffset();
        const dropX = gesture.moveX;
        const dropY = gesture.moveY;
        let idx: number | undefined;
        slotLayouts.current.forEach((layout, i) => {
          const within = dropX >= layout.x && dropX <= layout.x + layout.width && dropY >= layout.y && dropY <= layout.y + layout.height;
          if (within) idx = i;
        });
        if (idx !== undefined) {
          setPlaced(prev => {
            const next = [...prev];
            next[idx!] = option.id;
            return next;
          });
        }
      },
    });
  };

  // Check if the placed sequence matches any of the correct sequences
  const isSequenceCorrect = (placedSeq: (string | undefined)[]): boolean => {
    if (validSequences.length === 0) return false;
    return validSequences.some(seq => {
      if (placedSeq.length !== seq.length) return false;
      return placedSeq.every((id, i) => id === seq[i]);
    });
  };

  const check = () => {
    setSubmitted(true);
    const correct = isSequenceCorrect(placed);
    setIsCorrect(correct);
    setShowingExplanation(true);
  };

  const handleContinue = () => {
    const correct = isSequenceCorrect(placed);
    const explanation = isCorrect ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({ 
      correct, 
      placedIds: placed,
      isCorrect,
      explanation
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.slotsRow}>
        {Array.from({ length: slotsCount }).map((_, i) => (
          <View key={`slot-${i}`}
            onLayout={e => (slotLayouts.current[i] = e.nativeEvent.layout)}
            style={styles.slotCircle}
          />
        ))}
      </View>
      <View style={styles.optionsRow}>
        {options.map(o => {
          const pan = panValues[o.id] || new Animated.ValueXY({ x: 0, y: 0 });
          if (!panValues[o.id]) panValues[o.id] = pan;
          const resp = attachPanResponder(o);
          return (
            <Animated.View key={o.id} style={[styles.optionCandle, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} {...resp.panHandlers}>
              {renderOptionContent(o, svgCache, parsedCacheRef)}
            </Animated.View>
          );
        })}
      </View>
      <Pressable style={styles.submitButton} onPress={showingExplanation ? handleContinue : check}>
        <Text style={styles.submitText}>{showingExplanation ? 'המשך' : submitText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 14,
  },
  slotCircle: {
    width: 70,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  optionCandle: {
    marginHorizontal: 6,
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


