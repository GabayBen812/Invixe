import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import theme from "../../theme";
import { useChecklist, type ChecklistItem } from "../../hooks/useChecklist";

const CIRCLE_SIZE = 88;
const STROKE = 9;
const RADIUS = (CIRCLE_SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

function ProgressCircle({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  const pct = total > 0 ? done / total : 0;
  const offset = CIRC * (1 - pct);
  const color =
    pct === 1 ? theme.colors.growthGreen : theme.colors.primary[400];

  return (
    <View style={circle.wrap}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={theme.colors.neutral[200]}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRC} ${CIRC}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
        />
      </Svg>
      <View style={circle.label}>
        <Text style={circle.count}>{done}</Text>
        <Text style={circle.sep}>/{total}</Text>
      </View>
    </View>
  );
}

const circle = StyleSheet.create({
  wrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "baseline",
  },
  count: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
  },
  sep: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
  },
});

function ChecklistRow({
  item,
  onComplete,
  onFail,
  onDelete,
}: {
  item: ChecklistItem;
  onComplete: () => void;
  onFail: () => void;
  onDelete: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateTap = (cb: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 70,
        useNativeDriver: true,
      }),
    ]).start(() => cb());
  };

  const isCompleted = item.state === "completed";
  const isFailed = item.state === "failed";

  const rowBg = isCompleted
    ? theme.colors.success[100]
    : isFailed
      ? theme.colors.error[100]
      : theme.colors.surface.card;

  const textColor = isCompleted
    ? theme.colors.growthGreen
    : isFailed
      ? theme.colors.error[600]
      : theme.colors.text;

  const handleDelete = () => {
    Alert.alert("מחיקת תנאי", "האם למחוק תנאי זה?", [
      { text: "ביטול", style: "cancel" },
      { text: "מחק", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <Animated.View
      style={[
        row.wrap,
        { backgroundColor: rowBg },
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={[row.text, { color: textColor }]} numberOfLines={2}>
        {item.text}
      </Text>
      <View style={row.actions}>
        <Pressable
          style={[row.actionBtn, isCompleted ? row.activeComplete : row.completeBtn]}
          onPress={() => animateTap(onComplete)}
          hitSlop={6}
        >
          <Text style={[row.actionText, !isCompleted && { color: theme.colors.neutral[500] }]}>✓</Text>
        </Pressable>
        <Pressable
          style={[row.actionBtn, isFailed ? row.activeFail : row.failBtn]}
          onPress={() => animateTap(onFail)}
          hitSlop={6}
        >
          <Text style={[row.actionText, !isFailed && { color: theme.colors.neutral[500] }]}>✕</Text>
        </Pressable>
        <Pressable
          style={row.actionBtn}
          onPress={handleDelete}
          hitSlop={6}
        >
          <Text style={[row.actionText, { color: theme.colors.neutral[300] }]}>
            🗑
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 10,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.font.family,
    textAlign: "right",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.neutral[100],
  },
  actionText: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
  completeBtn: {
    backgroundColor: theme.colors.neutral[100],
  },
  activeComplete: {
    backgroundColor: theme.colors.growthGreen,
  },
  failBtn: {
    backgroundColor: theme.colors.neutral[100],
  },
  activeFail: {
    backgroundColor: theme.colors.error[600],
  },
});

export default function ChecklistTab() {
  const { items, setItemState, addItem, deleteItem, resetAll, completed } =
    useChecklist();
  const [addingText, setAddingText] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAdd = useCallback(() => {
    if (!addingText.trim()) return;
    addItem(addingText);
    setAddingText("");
    setShowAddInput(false);
  }, [addingText, addItem]);

  const allDone = completed === items.length && items.length > 0;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerCard}>
        <ProgressCircle done={completed} total={items.length} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>צ׳קליסט מסחר</Text>
          <Text style={styles.headerSub}>
            {completed} מתוך {items.length} תנאים הושלמו
          </Text>
          {allDone && (
            <Text style={styles.allDoneText}>✅ כל התנאים הושלמו!</Text>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.resetBtn,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            Alert.alert("איפוס", "לאפס את כל התנאים?", [
              { text: "ביטול", style: "cancel" },
              { text: "אפס", onPress: resetAll },
            ]);
          }}
        >
          <Text style={styles.resetBtnText}>אפס</Text>
        </Pressable>
      </View>

      {items.map((item) => (
        <ChecklistRow
          key={item.id}
          item={item}
          onComplete={() =>
            setItemState(
              item.id,
              item.state === "completed" ? "pending" : "completed",
            )
          }
          onFail={() =>
            setItemState(
              item.id,
              item.state === "failed" ? "pending" : "failed",
            )
          }
          onDelete={() => deleteItem(item.id)}
        />
      ))}

      {showAddInput ? (
        <View style={styles.addInputWrap}>
          <TextInput
            style={styles.addInput}
            value={addingText}
            onChangeText={setAddingText}
            placeholder="הכנס תנאי חדש..."
            placeholderTextColor={theme.colors.neutral[300]}
            textAlign="right"
            autoFocus
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <View style={styles.addInputBtns}>
            <Pressable
              style={styles.addCancelBtn}
              onPress={() => {
                setShowAddInput(false);
                setAddingText("");
              }}
            >
              <Text style={styles.addCancelText}>ביטול</Text>
            </Pressable>
            <Pressable
              style={[
                styles.addConfirmBtn,
                !addingText.trim() && styles.addConfirmDisabled,
              ]}
              onPress={handleAdd}
              disabled={!addingText.trim()}
            >
              <Text style={styles.addConfirmText}>הוסף</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.addCondBtn,
            pressed && styles.pressed,
          ]}
          onPress={() => setShowAddInput(true)}
        >
          <Text style={styles.addCondBtnText}>+ הוסף תנאי</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    padding: 16,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  headerText: {
    flex: 1,
    gap: 3,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    textAlign: "right",
  },
  headerSub: {
    fontSize: 13,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[500],
    textAlign: "right",
  },
  allDoneText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.growthGreen,
    marginTop: 2,
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.neutral[100],
  },
  resetBtnText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
  },
  addCondBtn: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary[400],
    borderStyle: "dashed",
    borderRadius: theme.radius.md,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  addCondBtnText: {
    fontSize: 15,
    fontFamily: theme.font.bold,
    color: theme.colors.primary[500],
  },
  addInputWrap: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[400],
    padding: 12,
    gap: 10,
    marginTop: 4,
  },
  addInput: {
    fontSize: 15,
    fontFamily: theme.font.family,
    color: theme.colors.text,
    textAlign: "right",
    paddingVertical: 0,
  },
  addInputBtns: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  addCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.neutral[100],
  },
  addCancelText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
  },
  addConfirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary[500],
  },
  addConfirmDisabled: {
    opacity: 0.45,
  },
  addConfirmText: {
    fontSize: 13,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
