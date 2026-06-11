import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";
import theme from "../../theme";
import { DICTIONARY_TOPICS } from "../../data/dictionary";
import { dictionaryTextRtl } from "./dictionaryRtl";

type Props = {
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
};

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
      {[...DICTIONARY_TOPICS].reverse().map((topic) => {
        const selected = topic.id === selectedTopicId;
        return (
          <Pressable
            key={topic.id}
            onPress={() => onSelectTopic(topic.id)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {topic.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  content: {
    flexDirection: "row",
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.card,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  chipSelected: {
    backgroundColor: theme.colors.info[100],
    borderColor: theme.colors.primary[400],
  },
  chipText: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[700],
    ...dictionaryTextRtl,
  },
  chipTextSelected: {
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
  },
});
