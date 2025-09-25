import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, PanResponder, Animated } from 'react-native';
import { DragonflyDoji, InvertedHammerNew, Doji, ShootingStar, RegularDoji, Hammer } from '../../assets/Candels';

interface SlotSpec {
  id: string;
  drawKey?: 'hammer' | 'invertedHammerNew' | 'doji' | 'dragonflyDoji' | 'regularDoji' | 'shootingStar';
  imageSource?: any;
  labelBelow?: string;
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
  onSubmit: (result: { numCorrect: number; total: number; mapping: Record<string, string | undefined> }) => void;
}

type Position = { x: number; y: number };

export default function DragMatchDrill({ slots, tokens, submitText = 'אישור', onSubmit }: Props) {
  const [tokenPositions, setTokenPositions] = useState<Record<string, Position>>({});
  const [tokenToSlot, setTokenToSlot] = useState<Record<string, string | undefined>>({});

  const slotRefs = useRef<Record<string, View | null>>({});
  const slotLayouts = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});

  const tokenAnimated = useRef<Record<string, Animated.ValueXY>>({}).current;

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
    let numCorrect = 0;
    tokens.forEach(t => {
      if (tokenToSlot[t.id] === t.targetSlotId) numCorrect += 1;
    });
    onSubmit({ numCorrect, total: tokens.length, mapping: tokenToSlot });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {slots.slice(0, 2).map(s => (
          <View key={s.id} ref={(ref: any) => (slotRefs.current[s.id] = ref)}
            onLayout={e => (slotLayouts.current[s.id] = e.nativeEvent.layout)}
            style={styles.slotBox}>
            {getCandleForKey(s.drawKey)}
            <View style={styles.slotUnderline} />
          </View>
        ))}
      </View>
      <View style={styles.topRow}>
        {slots.slice(2, 4).map(s => (
          <View key={s.id} ref={(ref: any) => (slotRefs.current[s.id] = ref)}
            onLayout={e => (slotLayouts.current[s.id] = e.nativeEvent.layout)}
            style={styles.slotBox}>
            {getCandleForKey(s.drawKey)}
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
      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>{submitText}</Text>
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


