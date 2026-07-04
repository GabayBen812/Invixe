import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../theme";
import type { JournalEntry } from "../../hooks/useJournal";

type Draft = Omit<JournalEntry, "id" | "createdAt">;

type Props = {
  visible: boolean;
  onSave: (entry: Draft) => void;
  onCancel: () => void;
};

function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  colorMap,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  colorMap?: Partial<Record<T, string>>;
}) {
  return (
    <View style={seg.wrap}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        const activeColor = colorMap?.[opt.value] ?? theme.colors.primary[500];
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              seg.option,
              isActive && { backgroundColor: activeColor },
            ]}
          >
            <Text style={[seg.label, isActive && seg.labelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const seg = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
    padding: 3,
    gap: 3,
  },
  option: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
  },
  labelActive: {
    color: "#FFFFFF",
  },
});

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function AddTradeModal({ visible, onSave, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [result, setResult] = useState<"win" | "loss">("win");
  const [date, setDate] = useState(todayIso());
  const [riskReward, setRiskReward] = useState("");
  const [entryReason, setEntryReason] = useState("");
  const [reflection, setReflection] = useState("");

  const reset = () => {
    setSymbol("");
    setDirection("long");
    setResult("win");
    setDate(todayIso());
    setRiskReward("");
    setEntryReason("");
    setReflection("");
  };

  const handleSave = () => {
    if (!symbol.trim()) return;
    onSave({
      symbol: symbol.trim().toUpperCase(),
      direction,
      result,
      date,
      riskReward: riskReward.trim() || "—",
      entryReason: entryReason.trim(),
      reflection: reflection.trim(),
    });
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>עסקה חדשה</Text>
          <Pressable
            onPress={handleCancel}
            style={styles.closeBtn}
            hitSlop={8}
          >
            <Text style={styles.closeBtnText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.form,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Field label="סמל / נייר ערך">
            <TextInput
              style={[styles.input, styles.inputSymbol]}
              value={symbol}
              onChangeText={(t) => setSymbol(t.toUpperCase())}
              placeholder="AAPL"
              placeholderTextColor={theme.colors.neutral[300]}
              autoCapitalize="characters"
              returnKeyType="next"
            />
          </Field>

          <Field label="כיוון">
            <SegmentControl
              options={[
                { value: "short" as const, label: "שורט" },
                { value: "long" as const, label: "לונג" },
              ]}
              value={direction}
              onChange={setDirection}
              colorMap={{
                long: theme.colors.growthGreen,
                short: theme.colors.error[600],
              }}
            />
          </Field>

          <Field label="תוצאה">
            <SegmentControl
              options={[
                { value: "loss" as const, label: "הפסד" },
                { value: "win" as const, label: "רווח" },
              ]}
              value={result}
              onChange={setResult}
              colorMap={{
                win: theme.colors.growthGreen,
                loss: theme.colors.error[600],
              }}
            />
          </Field>

          <Field label="תאריך">
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.neutral[300]}
              keyboardType="numbers-and-punctuation"
            />
          </Field>

          <Field label="R/R (לדוגמה 1:2)">
            <TextInput
              style={styles.input}
              value={riskReward}
              onChangeText={setRiskReward}
              placeholder="1:2"
              placeholderTextColor={theme.colors.neutral[300]}
              keyboardType="numbers-and-punctuation"
            />
          </Field>

          <Field label="סיבת כניסה">
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={entryReason}
              onChangeText={setEntryReason}
              placeholder="מה הסיבה לכניסה לעסקה?"
              placeholderTextColor={theme.colors.neutral[300]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              textAlign="right"
            />
          </Field>

          <Field label="מה למדתי?">
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={reflection}
              onChangeText={setReflection}
              placeholder="רשום תובנות לאחר העסקה..."
              placeholderTextColor={theme.colors.neutral[300]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              textAlign="right"
            />
          </Field>

          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && styles.pressed,
              ]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelBtnText}>ביטול</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                !symbol.trim() && styles.saveBtnDisabled,
                pressed && styles.pressed,
              ]}
              onPress={handleSave}
              disabled={!symbol.trim()}
            >
              <Text style={styles.saveBtnText}>שמור</Text>
            </Pressable>
          </View>
        </ScrollView>
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
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    flex: 1,
    textAlign: "right",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 24,
    color: theme.colors.neutral[700],
    lineHeight: 28,
  },
  form: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[700],
    textAlign: "right",
  },
  input: {
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
  },
  inputSymbol: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    letterSpacing: 1,
    textAlign: "center",
  },
  inputMulti: {
    minHeight: 88,
    paddingTop: 12,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary[500],
    alignItems: "center",
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
