import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import theme from "../../theme";

export type KnowledgeTab = "glossary" | "journal" | "checklist" | "research";

const TABS: { id: KnowledgeTab; label: string }[] = [
  { id: "research", label: "מחקר" },
  { id: "checklist", label: "צ'קליסט" },
  { id: "journal", label: "יומן" },
  { id: "glossary", label: "מילון" },
];

type Props = {
  active: KnowledgeTab;
  onChange: (tab: KnowledgeTab) => void;
};

export default function KnowledgeTabBar({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            style={styles.tab}
            onPress={() => onChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
    marginHorizontal: theme.spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    position: "relative",
  },
  label: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
  },
  labelActive: {
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
  },
  indicator: {
    position: "absolute",
    bottom: -1,
    left: "20%",
    right: "20%",
    height: 2,
    borderRadius: 2,
    backgroundColor: theme.colors.primary[500],
  },
});
