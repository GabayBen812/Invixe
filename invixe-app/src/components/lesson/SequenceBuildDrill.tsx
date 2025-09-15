import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, PanResponder } from 'react-native';
import { BullishCandleSVG, BearishCandleSVG, DojiCandleSVG } from './CandlestickSVGs';
import { DragonflyDoji, InvertedHammerNew, RegularDoji, ShootingStar, Hammer, BullishEngulfing, BearishEngulfing } from '../../assets/Candels';

type CandleKey = 'bullish' | 'bearish' | 'doji' | 'hammer' | 'invertedHammerNew' | 'dragonflyDoji' | 'regularDoji' | 'bullishEngulfing' | 'bearishEngulfing' | 'shootingStar';

export interface SequenceOption {
  id: string;
  candleKey: CandleKey;
}

interface Props {
  slotsCount: number;
  options: SequenceOption[];
  correctSequence: string[]; // option ids in correct order
  submitText?: string;
  onSubmit: (payload: { correct: boolean; placedIds: (string | undefined)[] }) => void;
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

export default function SequenceBuildDrill({ slotsCount, options, correctSequence, submitText = 'אישור', onSubmit }: Props) {
  const [placed, setPlaced] = useState<(string | undefined)[]>(Array(slotsCount).fill(undefined));
  const slotLayouts = useRef<{ x: number; y: number; width: number; height: number }[]>([]);
  const panValues = useRef<Record<string, Animated.ValueXY>>({}).current;

  const attachPanResponder = (option: SequenceOption) => {
    if (!panValues[option.id]) panValues[option.id] = new Animated.ValueXY({ x: 0, y: 0 });
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
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

  const check = () => {
    const correct = placed.length === correctSequence.length && placed.every((id, i) => id === correctSequence[i]);
    onSubmit({ correct, placedIds: placed });
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
              <CandleByKey keyName={o.candleKey} />
            </Animated.View>
          );
        })}
      </View>
      <Pressable style={styles.submitButton} onPress={check}>
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


