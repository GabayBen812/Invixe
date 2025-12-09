import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, PanResponder, Animated } from 'react-native';
import { DragonflyDoji, InvertedHammerNew, Doji, ShootingStar, RegularDoji, Hammer } from '../../assets/Candels';
import { parseSVGCode } from '../../utils/svgParser';

interface SlotSpec {
  id: string;
  drawKey?: 'hammer' | 'invertedHammerNew' | 'doji' | 'dragonflyDoji' | 'regularDoji' | 'shootingStar';
  imageSource?: any;
  labelBelow?: string;
  svgCode?: string;
  svgUrl?: string;
  svgPublicUrl?: string;
  svgPath?: string;
}

interface TokenSpec {
  id: string;
  label: string;
  targetSlotId: string;
}

interface Props {
  slots: SlotSpec[];
  tokens: TokenSpec[];
  submitText?: string;
  correctExplanation?: string;
  wrongExplanation?: string;
  onSubmit: (result: { 
    numCorrect: number; 
    total: number; 
    mapping: Record<string, string | undefined>; 
    isCorrect: boolean;
    explanation: string;
  }) => void;
}

type Position = { x: number; y: number };

export default function DragMatchDrill({ slots, tokens, submitText = 'אישור', correctExplanation, wrongExplanation, onSubmit }: Props) {
  const [tokenPositions, setTokenPositions] = useState<Record<string, Position>>({});
  const [tokenToSlot, setTokenToSlot] = useState<Record<string, string | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [svgCache, setSvgCache] = useState<Record<string, string>>({});
  const parsedCacheRef = useRef<Record<string, React.ReactElement>>({});

  const slotRefs = useRef<Record<string, View | null>>({});
  const slotLayouts = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});

  const tokenAnimated = useRef<Record<string, Animated.ValueXY>>({}).current;

  // Fetch SVGs from URLs
  useEffect(() => {
    const fetchSVGs = async () => {
      const promises = slots.map(async (slot) => {
        if (slot.svgPublicUrl && !svgCache[slot.id]) {
          try {
            const response = await fetch(slot.svgPublicUrl);
            const text = await response.text();
            setSvgCache(prev => ({ ...prev, [slot.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${slot.id}:`, e);
          }
        } else if (slot.svgUrl && !svgCache[slot.id]) {
          try {
            const response = await fetch(slot.svgUrl);
            const text = await response.text();
            setSvgCache(prev => ({ ...prev, [slot.id]: text }));
          } catch (e) {
            console.error(`Failed to fetch SVG for ${slot.id}:`, e);
          }
        }
      });
      await Promise.all(promises);
    };
    fetchSVGs();
  }, [slots.map(s => s.svgPublicUrl || s.svgUrl || s.id).join(',')]);

  const getCandleForKey = (key?: SlotSpec['drawKey']) => {
    if (!key) return null;
    switch (key) {
      case 'hammer':
        return <Hammer width={34} height={120} />
      case 'invertedHammerNew':
        return <InvertedHammerNew width={34} height={120} />
      case 'doji':
        return <Doji width={40} height={110} />
      case 'dragonflyDoji':
        return <DragonflyDoji width={40} height={110} />
      case 'regularDoji':
        return <RegularDoji width={40} height={110} />
      case 'shootingStar':
        return <ShootingStar width={34} height={120} />
      default:
        return null;
    }
  };

  const renderSlotContent = (slot: SlotSpec) => {
    // Priority: 1) svgPublicUrl (from cache), 2) svgCode, 3) svgUrl (from cache), 4) drawKey, 5) imageSource
    let svgCodeToParse: string | undefined;
    
    if (slot.svgPublicUrl && svgCache[slot.id]) {
      svgCodeToParse = svgCache[slot.id];
    } else if (slot.svgCode) {
      svgCodeToParse = slot.svgCode;
    } else if (slot.svgUrl && svgCache[slot.id]) {
      svgCodeToParse = svgCache[slot.id];
    }
    
    if (svgCodeToParse) {
      const cacheKey = `${slot.id}-${svgCodeToParse.substring(0, 50)}`;
      if (parsedCacheRef.current[cacheKey]) {
        return (
          <View style={{ width: 34, height: 120, alignItems: 'center', justifyContent: 'center' }}>
            {parsedCacheRef.current[cacheKey]}
          </View>
        );
      }
      
      const parsedSVG = parseSVGCode(svgCodeToParse);
      if (parsedSVG) {
        parsedCacheRef.current[cacheKey] = parsedSVG;
        return (
          <View style={{ width: 34, height: 120, alignItems: 'center', justifyContent: 'center' }}>
            {parsedSVG}
          </View>
        );
      }
    }
    
    // Fallback to drawKey or imageSource
    if (slot.drawKey) {
      return getCandleForKey(slot.drawKey);
    }
    
    if (slot.imageSource) {
      // If imageSource is provided, render it (would need Image component)
      return null; // For now, return null as imageSource handling would need Image component
    }
    
    return null;
  };

  const attachPanResponder = (token: TokenSpec) => {
    if (!tokenAnimated[token.id]) tokenAnimated[token.id] = new Animated.ValueXY({ x: 0, y: 0 });

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        tokenAnimated[token.id].setOffset({
          x: (tokenAnimated[token.id].x as any)._value,
          y: (tokenAnimated[token.id].y as any)._value,
        });
        tokenAnimated[token.id].setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: tokenAnimated[token.id].x, dy: tokenAnimated[token.id].y },
      ], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        tokenAnimated[token.id].flattenOffset();
        // Find slot hit
        const dropX = gesture.moveX;
        const dropY = gesture.moveY;
        let matchedSlot: string | undefined;
        Object.entries(slotLayouts.current).forEach(([slotId, layout]) => {
          const within = dropX >= layout.x && dropX <= layout.x + layout.width && dropY >= layout.y && dropY <= layout.y + layout.height;
          if (within) matchedSlot = slotId;
        });
        setTokenToSlot(prev => ({ ...prev, [token.id]: matchedSlot }));
      },
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let numCorrect = 0;
    tokens.forEach(t => {
      if (tokenToSlot[t.id] === t.targetSlotId) numCorrect += 1;
    });
    const correct = numCorrect === tokens.length;
    setIsCorrect(correct);
    setShowingExplanation(true);
  };

  const handleContinue = () => {
    let numCorrect = 0;
    tokens.forEach(t => {
      if (tokenToSlot[t.id] === t.targetSlotId) numCorrect += 1;
    });
    const explanation = isCorrect ? (correctExplanation || '') : (wrongExplanation || '');
    onSubmit({ 
      numCorrect, 
      total: tokens.length, 
      mapping: tokenToSlot,
      isCorrect,
      explanation
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {slots.slice(0, 2).map(s => (
          <View key={s.id} ref={(ref: any) => (slotRefs.current[s.id] = ref)}
            onLayout={e => (slotLayouts.current[s.id] = e.nativeEvent.layout)}
            style={styles.slotBox}>
            {renderSlotContent(s)}
            <View style={styles.slotUnderline} />
          </View>
        ))}
      </View>
      <View style={styles.topRow}>
        {slots.slice(2, 4).map(s => (
          <View key={s.id} ref={(ref: any) => (slotRefs.current[s.id] = ref)}
            onLayout={e => (slotLayouts.current[s.id] = e.nativeEvent.layout)}
            style={styles.slotBox}>
            {renderSlotContent(s)}
            <View style={styles.slotUnderline} />
          </View>
        ))}
      </View>
      <View style={styles.tokensRow}>
        {tokens.map(t => {
          const pan = tokenAnimated[t.id] || new Animated.ValueXY({ x: 0, y: 0 });
          if (!tokenAnimated[t.id]) tokenAnimated[t.id] = pan;
          const responder = attachPanResponder(t);
          return (
            <Animated.View key={t.id} style={[styles.token, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} {...responder.panHandlers}>
              <Text style={styles.tokenText}>{t.label}</Text>
            </Animated.View>
          );
        })}
      </View>
      <Pressable style={styles.submitButton} onPress={showingExplanation ? handleContinue : handleSubmit}>
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
  topRow: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  slotBox: {
    width: 120,
    height: 160,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  slotUnderline: {
    width: 70,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
  },
  tokensRow: {
    width: '100%',
    paddingHorizontal: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  token: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 6,
  },
  tokenText: {
    color: '#0D2033',
    fontWeight: '700',
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


