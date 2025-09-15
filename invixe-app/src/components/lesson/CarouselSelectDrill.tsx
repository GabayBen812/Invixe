import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';

export interface CarouselItem {
  id: string;
  imageSource?: any;
  label?: string;
}

interface Props {
  items: CarouselItem[];
  correctId: string;
  explanationOnWrong?: string;
  submitText?: string;
  onSubmit: (payload: { correct: boolean; selectedId: string; explanation?: string }) => void;
}

export default function CarouselSelectDrill({ items, correctId, explanationOnWrong, submitText = 'אישור', onSubmit }: Props) {
  const [index, setIndex] = useState(0);

  const normalizedItems = useMemo(() => items.length > 0 ? items : [], [items]);
  const selected = normalizedItems[index] || normalizedItems[0];

  const goLeft = () => setIndex(prev => (prev - 1 + normalizedItems.length) % normalizedItems.length);
  const goRight = () => setIndex(prev => (prev + 1) % normalizedItems.length);

  const handleSubmit = () => {
    const correct = selected?.id === correctId;
    onSubmit({ correct, selectedId: selected?.id, explanation: correct ? undefined : explanationOnWrong });
  };

  if (normalizedItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.carouselRow}>
        <Pressable onPress={goLeft} style={[styles.arrowButton, styles.arrowLeft]} hitSlop={12}>
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>
        <View style={styles.centerCard}>
          {selected?.imageSource ? (
            <Image source={selected.imageSource} style={styles.image} />
          ) : null}
          {selected?.label ? (
            <Text style={styles.label}>{selected.label}</Text>
          ) : null}
        </View>
        <Pressable onPress={goRight} style={[styles.arrowButton, styles.arrowRight]} hitSlop={12}>
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
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
  arrowLeft: {},
  arrowRight: {},
  arrowText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0D2033',
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


