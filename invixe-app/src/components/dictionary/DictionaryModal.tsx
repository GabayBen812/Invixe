import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import Svg, { Path } from "react-native-svg";
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
import KnowledgeTabBar, { type KnowledgeTab } from "../knowledge/KnowledgeTabBar";
import JournalTab from "../knowledge/JournalTab";
import ChecklistTab from "../knowledge/ChecklistTab";

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21L15 15M17 11C17 14.3137 14.3137 17 11 17C7.68629 17 5 14.3137 5 11C5 7.68629 7.68629 5 11 5C14.3137 5 17 7.68629 17 11Z"
        stroke={theme.colors.neutral[400]}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function DictionaryModal() {
  const insets = useSafeAreaInsets();
  const { isDictionaryOpen, closeDictionary, currentTopic, suggestedTermId, unlockMap } =
    useDictionary();
  const { completedLessons } = useUser();

  const [activeTab, setActiveTab] = useState<KnowledgeTab>("glossary");
  const [selectedTopicId, setSelectedTopicId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);

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
        setActiveTab("glossary");
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

  const selectedEntryIndex = useMemo(() => {
    if (!selectedEntry) return -1;
    return entries.findIndex((e) => e.id === selectedEntry.id);
  }, [selectedEntry, entries]);

  const handleClose = () => {
    closeDictionary();
    setSelectedEntry(null);
    setSearchQuery("");
  };

  const handleBackToBrowse = () => setSelectedEntry(null);

  const handleTabChange = (tab: KnowledgeTab) => {
    setActiveTab(tab);
    if (tab !== "glossary") setSelectedEntry(null);
  };

  const handlePrev = useCallback(() => {
    if (selectedEntryIndex <= 0) return;
    setSelectedEntry(entries[selectedEntryIndex - 1] ?? null);
  }, [selectedEntryIndex, entries]);

  const handleNext = useCallback(() => {
    if (selectedEntryIndex < 0 || selectedEntryIndex >= entries.length - 1) return;
    setSelectedEntry(entries[selectedEntryIndex + 1] ?? null);
  }, [selectedEntryIndex, entries]);

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
          <Text style={styles.title}>מרכז הידע</Text>
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

        <KnowledgeTabBar active={activeTab} onChange={handleTabChange} />

        {activeTab === "glossary" && (
          selectedEntry ? (
            <DictionaryTermDetail
              entry={selectedEntry}
              onBack={handleBackToBrowse}
              onPrev={selectedEntryIndex > 0 ? handlePrev : undefined}
              onNext={
                selectedEntryIndex >= 0 && selectedEntryIndex < entries.length - 1
                  ? handleNext
                  : undefined
              }
              position={
                selectedEntryIndex >= 0
                  ? { current: selectedEntryIndex + 1, total: entries.length }
                  : undefined
              }
            />
          ) : (
            <>
              <View style={styles.searchContainer}>
                <View style={styles.searchWrap}>
                  <SearchIcon />
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
          )
        )}

        {activeTab === "journal" && (
          <View style={styles.tabContent}>
            <JournalTab />
          </View>
        )}

        {activeTab === "checklist" && (
          <View style={styles.tabContent}>
            <ChecklistTab />
          </View>
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
    paddingTop: theme.spacing.sm,
    paddingBottom: 4,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.surface.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    paddingHorizontal: 14,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: theme.font.family,
    color: theme.colors.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  listContainer: {
    flex: 1,
    marginTop: 4,
  },
  tabContent: {
    flex: 1,
  },
});
