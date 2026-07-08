import React from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../theme";
import TradeHistoryRow, { type TradeHistoryItem } from "./TradeHistoryRow";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MODAL_MAX_HEIGHT = Math.round(SCREEN_HEIGHT * 0.8);

function CloseIcon({ color = theme.colors.neutral[500], size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  trades: TradeHistoryItem[];
};

export default function TradeHistoryModal({ visible, onClose, trades }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 },
        ]}
      >
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="סגור"
        />
        <View
          style={[styles.card, { maxHeight: MODAL_MAX_HEIGHT }]}
        >
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="סגור"
            >
              <CloseIcon />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.title}>היסטוריית מסחר מלאה</Text>
              <Text style={styles.subtitle}>
                {trades.length} {trades.length === 1 ? "פעולה" : "פעולות"}
              </Text>
            </View>
          </View>

          {trades.length === 0 ? (
            <Text style={styles.emptyText}>עדיין אין פעולות מסחר</Text>
          ) : (
            <ScrollView
              style={[
                styles.list,
                Platform.OS === "android" && {
                  height: Math.max(220, MODAL_MAX_HEIGHT - 110),
                },
              ]}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              bounces={Platform.OS === "ios"}
            >
              {trades.map((trade, index) => (
                <TradeHistoryRow
                  key={trade.id || `${trade.symbol}-${trade.createdAt}-${index}`}
                  trade={trade}
                  showDivider={index < trades.length - 1}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surface.overlay,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.lg,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    zIndex: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  closeButtonPressed: {
    backgroundColor: theme.colors.neutral[200],
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "right",
    marginTop: 2,
  },
  list: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: theme.spacing.sm,
    flexGrow: 0,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "center",
    paddingVertical: 22,
  },
});
