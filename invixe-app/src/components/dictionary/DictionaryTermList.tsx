import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import theme from "../../theme";
import type {
  DictionaryEntry,
  DictionaryUnlockMap,
} from "../../data/dictionary";
import DictionaryTermRow from "./DictionaryTermRow";
import { dictionaryTextRtl } from "./dictionaryRtl";

type Props = {
  entries: DictionaryEntry[];
  completedLessons: number[];
  unlockMap?: DictionaryUnlockMap;
  isEntryUnlocked: (
    entry: DictionaryEntry,
    completedLessons: number[],
    unlockMap?: DictionaryUnlockMap,
  ) => boolean;
  onSelectEntry: (entry: DictionaryEntry) => void;
};

export default function DictionaryTermList({
  entries,
  completedLessons,
  unlockMap,
  isEntryUnlocked,
  onSelectEntry,
}: Props) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>לא נמצאו מונחים</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => {
        const locked = !isEntryUnlocked(item, completedLessons, unlockMap);
        return (
          <DictionaryTermRow
            entry={item}
            isLocked={locked}
            onPress={() => {
              if (!locked) onSelectEntry(item);
            }}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  empty: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingTop: 48,
    paddingHorizontal: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    ...dictionaryTextRtl,
  },
});
