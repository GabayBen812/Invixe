import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import theme from "../../theme";

interface BottomNavbarProps {
  activeTab?: "map" | "profile" | "graph";
  onTabPress?: (tab: "map" | "profile" | "graph") => void;
}

const TAB_SIZE = 24;

export default function BottomNavbar({
  activeTab = "map",
  onTabPress,
}: BottomNavbarProps) {
  const tabs = [
    { id: "map", label: "שיעורים" },
    { id: "graph", label: "מסחר" },
    { id: "profile", label: "פרופיל" },
  ] as const;

  const renderIcon = (tabId: string, isActive: boolean) => {
    const color = isActive ? theme.colors.primaryBlue : theme.colors.text;

    switch (tabId) {
      case "map":
        return (
          <Svg width={TAB_SIZE} height={TAB_SIZE} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8 7h8M8 11h8"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case "profile":
        return (
          <Svg width={TAB_SIZE} height={TAB_SIZE} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M4 21v-1a4 4 0 014-4h8a4 4 0 014 4v1"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case "graph":
        return (
          <Svg width={TAB_SIZE} height={TAB_SIZE} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 3v18h18"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress?.(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              {renderIcon(tab.id, isActive)}
              <Text
                style={[
                  styles.label,
                  isActive ? styles.labelActive : styles.labelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingBottom: 20,
    paddingTop: 10,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    alignSelf: "center",
    maxWidth: 320,
    width: "100%",
    paddingHorizontal: 24,
  },
  tab: {
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: theme.font.family,
    textAlign: "center",
  },
  labelActive: {
    color: theme.colors.primaryBlue,
    fontFamily: theme.font.bold,
  },
  labelInactive: {
    color: theme.colors.text,
  },
});
