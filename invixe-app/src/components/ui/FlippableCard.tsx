import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DictionaryEntry } from '../../data/dictionary';

interface FlippableCardProps {
  entry: DictionaryEntry;
  onFlip?: (entryId: string) => void;
  isLocked?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;
const HORIZONTAL_PADDING = 32; // 16px each side in drawer
const CARD_WIDTH = DRAWER_WIDTH - HORIZONTAL_PADDING;
const CARD_HEIGHT = 240; // Taller rectangle so term + explanation fit comfortably
const IMAGE_SIZE = Math.min(CARD_WIDTH - 48, 140); // Generous but bounded icon area

export default function FlippableCard({ entry, onFlip, isLocked = false }: FlippableCardProps) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handlePress = () => {
    // Don't allow flipping if locked
    if (isLocked) return;
    
    const toValue = isFlipped ? 0 : 1;
    
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setIsFlipped(!isFlipped);
    if (onFlip && !isFlipped) {
      onFlip(entry.id);
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  const ImageComponent = entry.imageComponent;

  // Render small locked icon for top-left corner
  const renderLockBadge = () => (
    <View style={styles.lockBadge}>
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path
          d="M10 2C8.34 2 7 3.34 7 5V7H5C4.45 7 4 7.45 4 8V16C4 16.55 4.45 17 5 17H15C15.55 17 16 16.55 16 16V8C16 7.45 15.55 7 15 7H13V5C13 3.34 11.66 2 10 2ZM10 3.5C10.83 3.5 11.5 4.17 11.5 5V7H8.5V5C8.5 4.17 9.17 3.5 10 3.5Z"
          fill="#64748B"
        />
      </Svg>
    </View>
  );

  return (
    <Pressable onPress={handlePress} style={styles.cardContainer} disabled={isLocked}>
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          isLocked && styles.cardLocked,
          frontAnimatedStyle,
        ]}
        pointerEvents={isFlipped ? 'none' : 'auto'}
      >
        {isLocked && renderLockBadge()}
        <View style={[styles.imageContainer, isLocked && styles.imageContainerLocked]}>
          {ImageComponent ? (
            <ImageComponent width={IMAGE_SIZE} height={IMAGE_SIZE} />
          ) : entry.imageUrl ? (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Image</Text>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{entry.term}</Text>
            </View>
          )}
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          backAnimatedStyle,
        ]}
        pointerEvents={isFlipped ? 'auto' : 'none'}
      >
        <View style={styles.backContent}>
          <Text style={styles.termText}>{entry.term}</Text>
          <ScrollView
            style={styles.explanationScroll}
            contentContainerStyle={styles.explanationScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.explanationText}>{entry.explanation}</Text>
          </ScrollView>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: 0,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    minHeight: IMAGE_SIZE,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'NotoSansHebrew',
  },
  backContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  termText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D2033',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'NotoSansHebrew',
  },
  explanationScroll: {
    flex: 1,
    width: '100%',
  },
  explanationScrollContent: {
    paddingBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'NotoSansHebrew',
  },
  cardLocked: {
    backgroundColor: '#E2E8F0',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainerLocked: {
    opacity: 0.4,
  },
});
