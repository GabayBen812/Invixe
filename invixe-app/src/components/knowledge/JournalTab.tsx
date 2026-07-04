import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import theme from "../../theme";
import { useJournal, type JournalEntry } from "../../hooks/useJournal";
import AddTradeModal from "./AddTradeModal";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={stat.card}>
      <Text style={stat.value}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  value: {
    fontSize: 22,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
    marginBottom: 3,
  },
  label: {
    fontSize: 11,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "center",
  },
});

function DirectionBadge({ direction }: { direction: "long" | "short" }) {
  const isLong = direction === "long";
  return (
    <View style={[badge.wrap, isLong ? badge.long : badge.short]}>
      <Text style={[badge.text, isLong ? badge.longText : badge.shortText]}>
        {isLong ? "לונג" : "שורט"}
      </Text>
    </View>
  );
}

function ResultBadge({ result }: { result: "win" | "loss" }) {
  const isWin = result === "win";
  return (
    <View style={[badge.wrap, isWin ? badge.win : badge.loss]}>
      <Text style={[badge.text, isWin ? badge.winText : badge.lossText]}>
        {isWin ? "רווח" : "הפסד"}
      </Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  text: {
    fontSize: 12,
    fontFamily: theme.font.bold,
  },
  long: { backgroundColor: theme.colors.info[100] },
  longText: { color: theme.colors.primary[500] },
  short: { backgroundColor: theme.colors.warning[100] },
  shortText: { color: theme.colors.warning[600] },
  win: { backgroundColor: theme.colors.success[100] },
  winText: { color: theme.colors.growthGreen },
  loss: { backgroundColor: theme.colors.error[100] },
  lossText: { color: theme.colors.error[600] },
});

function InfoChip({
  icon,
  text,
  flex,
}: {
  icon: string;
  text: string;
  flex?: boolean;
}) {
  return (
    <View style={[info.chip, flex && { flex: 1 }]}>
      <Text style={info.icon}>{icon}</Text>
      <Text style={info.text} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const info = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  icon: { fontSize: 11 },
  text: {
    fontSize: 12,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[700],
  },
});

function EntryCard({
  entry,
  onDelete,
}: {
  entry: JournalEntry;
  onDelete: () => void;
}) {
  const isWin = entry.result === "win";

  const handleDelete = () => {
    Alert.alert("מחיקת עסקה", "האם אתה בטוח שברצונך למחוק עסקה זו?", [
      { text: "ביטול", style: "cancel" },
      { text: "מחק", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={card.wrap}>
      <View style={card.header}>
        <Pressable onPress={handleDelete} hitSlop={8} style={card.deleteBtn}>
          <Text style={card.deleteText}>✕</Text>
        </Pressable>
        <View style={card.badges}>
          <ResultBadge result={entry.result} />
          <DirectionBadge direction={entry.direction} />
        </View>
        <Text style={card.symbol}>{entry.symbol}</Text>
      </View>

      <View style={card.infoRow}>
        <InfoChip icon="📅" text={entry.date} />
        {entry.riskReward !== "—" && (
          <InfoChip icon="⚖️" text={entry.riskReward} />
        )}
        {entry.entryReason ? (
          <InfoChip icon="📝" text={entry.entryReason} flex />
        ) : null}
      </View>

      {entry.reflection ? (
        <View
          style={[
            card.reflection,
            {
              backgroundColor: isWin
                ? theme.colors.success[100]
                : theme.colors.error[100],
            },
          ]}
        >
          <Text style={card.reflectionLabel}>מה למדתי?</Text>
          <Text
            style={[
              card.reflectionText,
              {
                color: isWin
                  ? theme.colors.growthGreen
                  : theme.colors.error[600],
              },
            ]}
          >
            {entry.reflection}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing.sm,
    overflow: "hidden",
    shadowColor: theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  symbol: {
    fontSize: 20,
    fontFamily: theme.font.bold,
    color: theme.colors.text,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  deleteBtn: {
    padding: 4,
  },
  deleteText: {
    fontSize: 14,
    color: theme.colors.neutral[300],
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 12,
    justifyContent: "flex-end",
  },
  reflection: {
    padding: 12,
    gap: 4,
  },
  reflectionLabel: {
    fontSize: 11,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[500],
    textAlign: "right",
  },
  reflectionText: {
    fontSize: 14,
    fontFamily: theme.font.family,
    textAlign: "right",
    lineHeight: 20,
  },
});

export default function JournalTab() {
  const { entries, addEntry, deleteEntry, stats } = useJournal();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.statsRow}>
          <StatCard label="עסקאות" value={stats.total} />
          <StatCard
            label="אחוז הצלחה"
            value={stats.total ? `${stats.winRate}%` : "—"}
          />
          <StatCard label="R/R ממוצע" value={stats.avgRR} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.newBtn, pressed && styles.pressed]}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.newBtnText}>+ עסקה חדשה</Text>
        </Pressable>

        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📒</Text>
            <Text style={styles.emptyTitle}>היומן ריק</Text>
            <Text style={styles.emptySubtitle}>
              תעד את העסקאות שלך כדי ללמוד מהן
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => deleteEntry(entry.id)}
            />
          ))
        )}
      </ScrollView>

      <AddTradeModal
        visible={showModal}
        onSave={(draft) => {
          addEntry(draft);
          setShowModal(false);
        }}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  newBtn: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  newBtnText: {
    fontSize: 16,
    fontFamily: theme.font.bold,
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  empty: {
    alignItems: "center",
    paddingTop: 48,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: theme.font.bold,
    color: theme.colors.neutral[700],
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: theme.font.family,
    color: theme.colors.neutral[400],
    textAlign: "center",
  },
});
