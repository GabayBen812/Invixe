import React, { useEffect, useRef } from "react";
import { ScrollView, Pressable, Text, StyleSheet, Animated } from "react-native";
import theme from "../../theme";
import { DICTIONARY_TOPICS } from "../../data/dictionary";

type Props = {
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
};

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.94,
          useNativeDriver: true,
          speed: 60,
          bounciness: 2,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 3,
        }).start()
      }
    >
      <Animated.View
        style={[
          styles.chip,
          selected && styles.chipSelected,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function DictionaryTopicChips({
  selectedTopicId,
  onSelectTopic,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    });
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {[...DICTIONARY_TOPICS].reverse().map((topic) => (
        <Chip
          key={topic.id}
          label={topic.title}
          selected={topic.id === selectedTopicId}
          onPress={() => onSelectTopic(topic.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginTop: 4,
    marginBottom: 8,
  },
  content: {
    flexDirection: "row",
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.md,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.card,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
    shadowColor: theme.colors.primary[500],
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[700],
  },
  chipTextSelected: {
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
});
