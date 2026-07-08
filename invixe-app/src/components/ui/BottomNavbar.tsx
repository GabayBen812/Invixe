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
              d="M12 23C14.4477 23 16.3465 22.8672 17.8271 22.5381C19.2964 22.2115 20.2925 21.7056 20.999 20.999C21.7056 20.2925 22.2115 19.2964 22.5381 17.8271C22.8672 16.3465 23 14.4477 23 12C23 9.55232 22.8672 7.65353 22.5381 6.17285C22.2115 4.70364 21.7056 3.70752 20.999 3.00098C20.2925 2.29443 19.2964 1.78846 17.8271 1.46191C16.3465 1.13284 14.4477 1 12 1C9.55232 1 7.65353 1.13284 6.17285 1.46191C4.70364 1.78846 3.70752 2.29443 3.00098 3.00098C2.29443 3.70752 1.78846 4.70364 1.46191 6.17285C1.13284 7.65353 1 9.55232 1 12C1 14.4477 1.13284 16.3465 1.46191 17.8271C1.78846 19.2964 2.29443 20.2925 3.00098 20.999C3.70752 21.7056 4.70364 22.2115 6.17285 22.5381C7.65353 22.8672 9.55232 23 12 23Z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 7V17M17 11V17M7 13V17"
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
