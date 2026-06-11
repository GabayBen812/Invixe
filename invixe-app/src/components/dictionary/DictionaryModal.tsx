import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../theme";
import { useDictionary } from "../../context/DictionaryContext";
import { useUser } from "../../context/UserContext";
import {
  filterEntries,
  getEntryById,
  isEntryUnlocked,
  type DictionaryEntry,
} from "../../data/dictionary";
import DictionaryTopicChips from "./DictionaryTopicChips";
import DictionaryTermList from "./DictionaryTermList";
import DictionaryTermDetail from "./DictionaryTermDetail";
import { dictionaryTextRtl } from "./dictionaryRtl";

export default function DictionaryModal() {
  const insets = useSafeAreaInsets();
  const { isDictionaryOpen, closeDictionary, currentTopic, suggestedTermId, unlockMap } =
    useDictionary();
  const { completedLessons } = useUser();

  const [selectedTopicId, setSelectedTopicId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(
    null,
  );

  useEffect(() => {
    if (!isDictionaryOpen) {
      setSelectedEntry(null);
      setSearchQuery("");
      return;
    }

    setSelectedTopicId(currentTopic || "all");

    if (suggestedTermId) {
      const entry = getEntryById(suggestedTermId);
      if (entry && isEntryUnlocked(entry, completedLessons, unlockMap)) {
        setSelectedEntry(entry);
        setSelectedTopicId(entry.topicId);
      } else {
        setSelectedEntry(null);
      }
    } else {
      setSelectedEntry(null);
    }
  }, [isDictionaryOpen, currentTopic, suggestedTermId, completedLessons, unlockMap]);

  const entries = filterEntries(
    searchQuery,
    selectedTopicId,
    completedLessons,
    unlockMap,
  );

  const handleClose = () => {
    closeDictionary();
    setSelectedEntry(null);
    setSearchQuery("");
  };

  const handleBackToBrowse = () => {
    setSelectedEntry(null);
  };

  return (
    <Modal
      visible={isDictionaryOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>מילון מושגים</Text>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        {selectedEntry ? (
          <DictionaryTermDetail
            entry={selectedEntry}
            onBack={handleBackToBrowse}
          />
        ) : (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="חיפוש מונח..."
                placeholderTextColor={theme.colors.neutral[400]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                textAlign="right"
                returnKeyType="search"
              />
            </View>

            <DictionaryTopicChips
              selectedTopicId={selectedTopicId}
              onSelectTopic={setSelectedTopicId}
            />

            <View style={styles.listContainer}>
              <DictionaryTermList
                entries={entries}
                completedLessons={completedLessons}
                unlockMap={unlockMap}
                isEntryUnlocked={isEntryUnlocked}
                onSelectEntry={setSelectedEntry}
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    ...dictionaryTextRtl,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.neutral[700],
    lineHeight: 28,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  searchInput: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: theme.font.family,
    color: theme.colors.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  listContainer: {
    flex: 1,
    marginTop: theme.spacing.sm,
  },
});
