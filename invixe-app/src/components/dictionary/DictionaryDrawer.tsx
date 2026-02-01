import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useDictionary } from '../../context/DictionaryContext';
import { useUser } from '../../context/UserContext';
import {
  DICTIONARY_TOPICS,
  getEntriesByTopic,
  calculateTopicProgress,
  getEntryById,
  isEntryUnlocked,
} from '../../data/dictionary';
import FlippableCard from '../ui/FlippableCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

type DictionaryViewMode = 'overview' | 'topic';

export default function DictionaryDrawer() {
  const { isDictionaryOpen, closeDictionary, currentTopic, suggestedTermId } = useDictionary();
  const { completedLessons } = useUser();
  const [selectedTopic, setSelectedTopic] = useState<string>(currentTopic || 'all');
  const [viewMode, setViewMode] = useState<DictionaryViewMode>('overview');
  const [progressMap, setProgressMap] = useState<Record<string, { seen: boolean; mastered: boolean }>>({});
  
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDictionaryOpen) {
      // If a specific topic is requested, jump directly into that topic view.
      // Otherwise start in the overview list (Figma design).
      const topic = currentTopic || 'all';
      setSelectedTopic(topic);
      setViewMode(currentTopic ? 'topic' : 'overview');
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDictionaryOpen]);

  useEffect(() => {
    if (suggestedTermId && isDictionaryOpen) {
      const entry = getEntryById(suggestedTermId);
      if (entry) {
        setSelectedTopic(entry.topicId);
        setViewMode('topic');
      }
    }
  }, [suggestedTermId, isDictionaryOpen]);

  if (!isDictionaryOpen) return null;

  const entries = getEntriesByTopic(selectedTopic);
  const progress = calculateTopicProgress(selectedTopic, progressMap);

  const handleCardFlip = (entryId: string) => {
    setProgressMap(prev => ({
      ...prev,
      [entryId]: { seen: true, mastered: prev[entryId]?.mastered || false },
    }));
  };

  const handleSelectTopicFromOverview = (topicId: string) => {
    setSelectedTopic(topicId);
    setViewMode('topic');
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedTopic('all');
  };

  const renderTopicIcon = (topicId: string) => {
    switch (topicId) {
      case 'all':
        return (
          <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Path d="M2 2H7V7H2V2Z" fill="#3F9FFF" />
            <Path d="M9 2H14V7H9V2Z" fill="#3F9FFF" />
            <Path d="M2 9H7V14H2V9Z" fill="#3F9FFF" />
            <Path d="M9 9H14V14H9V9Z" fill="#3F9FFF" />
          </Svg>
        );
      case 'candles':
        return (
          <Svg width={14} height={16} viewBox="0 0 14 16" fill="none">
            <Path d="M4 0V4H10V0M4 4V12H10V4M4 12V16H10V12" stroke="#3F9FFF" strokeWidth={2} strokeLinecap="round" />
            <Path d="M4 6H10" stroke="#3F9FFF" strokeWidth={2.5} />
            <Path d="M4 10H10" stroke="#3F9FFF" strokeWidth={2.5} />
          </Svg>
        );
      case 'graphs':
        return (
          <Svg width={16} height={14} viewBox="0 0 16 14" fill="none">
            <Path d="M1 13L5 9L9 11L15 3" stroke="#3F9FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M11 3H15V7" stroke="#3F9FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      case 'indicators':
        return (
          <Svg width={16} height={12} viewBox="0 0 16 12" fill="none">
            <Path d="M8 10C11.866 10 15 7.76142 15 5C15 2.23858 11.866 0 8 0C4.13401 0 1 2.23858 1 5C1 7.76142 4.13401 10 8 10Z" stroke="#3F9FFF" strokeWidth={2} />
            <Path d="M8 5L11 2" stroke="#3F9FFF" strokeWidth={2} strokeLinecap="round" />
          </Svg>
        );
      case 'markets':
        return (
          <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Path d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z" stroke="#3F9FFF" strokeWidth={2} />
            <Path d="M8 4V8L11 10" stroke="#3F9FFF" strokeWidth={2} strokeLinecap="round" />
          </Svg>
        );
      default:
        return (
          <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Path d="M2 2H7V7H2V2Z" fill="#3F9FFF" />
            <Path d="M9 2H14V7H9V2Z" fill="#3F9FFF" />
            <Path d="M2 9H7V14H2V9Z" fill="#3F9FFF" />
            <Path d="M9 9H14V14H9V9Z" fill="#3F9FFF" />
          </Svg>
        );
    }
  };

  return (
    <>
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <Pressable style={styles.backdropPressable} onPress={closeDictionary} />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>מילון מושגים</Text>
          <Pressable onPress={closeDictionary} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        {viewMode === 'overview' ? (
          <ScrollView style={styles.overviewContent} contentContainerStyle={styles.overviewContentContainer}>
            {DICTIONARY_TOPICS.map(topic => {
              const topicProgress = calculateTopicProgress(
                topic.id === 'all' ? 'all' : topic.id,
                progressMap
              );
              const isActive = selectedTopic === topic.id;
              return (
                <Pressable
                  key={topic.id}
                  style={[styles.overviewRow, isActive && styles.overviewRowActive]}
                  onPress={() => handleSelectTopicFromOverview(topic.id)}
                >
                  <View style={styles.overviewLeft}>
                    <Text style={styles.overviewPercent}>{topicProgress}%</Text>
                    <View style={styles.overviewBarTrack}>
                      <View style={[styles.overviewBarFill, { width: `${topicProgress}%` }]} />
                    </View>
                  </View>
                  <View style={styles.overviewRight}>
                    <Text style={styles.overviewTitle}>{topic.title}</Text>
                <View style={styles.overviewIconWrapper}>
                  <View style={styles.overviewIconInner}>
                    {renderTopicIcon(topic.id)}
                  </View>
                </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <>
            <View style={styles.topicHeaderContainer}>
              <View style={styles.topicHeaderCard}>
                <Text style={styles.progressText}>{progress}%</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.topicHeaderTitle}>
                  {DICTIONARY_TOPICS.find(t => t.id === selectedTopic)?.title || ''}
                </Text>
                <View style={styles.topicHeaderIcon}>
                  {renderTopicIcon(selectedTopic)}
                </View>
                <View style={styles.topicHeaderSeparatorContainer}>
                  <View style={styles.topicHeaderSeparatorBar} />
                  <View style={styles.topicHeaderSeparatorBar} />
                </View>
                <Pressable onPress={handleBackToOverview} style={styles.topicHeaderMenu}>
                  <Svg width={20} height={14} viewBox="0 0 20 14" fill="none">
                    <Path d="M1 1H19" stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />
                    <Path d="M1 7H19" stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />
                    <Path d="M1 13H19" stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                </Pressable>
              </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
              <View style={styles.cardsGrid}>
                {entries.map(entry => {
                  const locked = !isEntryUnlocked(entry, completedLessons);
                  return (
                    <FlippableCard
                      key={entry.id}
                      entry={entry}
                      onFlip={handleCardFlip}
                      isLocked={locked}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  backdropPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0D2033',
    fontFamily: 'NotoSansHebrew',
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#475569',
    fontWeight: '400',
  },
  topicHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  topicHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginRight: 10,
    fontFamily: 'NotoSansHebrew',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 14,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3F9FFF',
    borderRadius: 3,
  },
  topicHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3F9FFF',
    marginRight: 10,
    fontFamily: 'NotoSansHebrew',
  },
  topicHeaderIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topicHeaderSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
  },
  topicHeaderSeparatorBar: {
    width: 2.5,
    height: 18,
    backgroundColor: '#3F9FFF',
    borderRadius: 1.5,
  },
  topicHeaderMenu: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  cardsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  // Overview list styles (Figma side panel)
  overviewContent: {
    flex: 1,
  },
  overviewContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  overviewRowActive: {
    backgroundColor: '#E0EDFF',
  },
  overviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  overviewRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  overviewPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D2033',
    marginRight: 8,
    minWidth: 36,
    fontFamily: 'NotoSansHebrew',
  },
  overviewBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  overviewBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#3F9FFF',
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D2033',
    marginRight: 10,
    fontFamily: 'NotoSansHebrew',
  },
  overviewIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  overviewIconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
