import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../context/UserContext";

export type JournalEntry = {
  id: string;
  symbol: string;
  direction: "long" | "short";
  result: "win" | "loss";
  date: string;
  riskReward: string;
  entryReason: string;
  reflection: string;
  createdAt: number;
};

function storageKey(email: string | null) {
  return email
    ? `@invixe/journal_v1:${email}`
    : "@invixe/journal_v1:guest";
}

export function useJournal() {
  const { currentUserEmail } = useUser();
  const key = storageKey(currentUserEmail);

  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key).then((raw) => {
      if (cancelled) return;
      if (raw) {
        try {
          setEntries(JSON.parse(raw) as JournalEntry[]);
          return;
        } catch {}
      }
      setEntries([]);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const persist = useCallback(
    (next: JournalEntry[]) => {
      setEntries(next);
      void AsyncStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );

  const addEntry = useCallback(
    (draft: Omit<JournalEntry, "id" | "createdAt">) => {
      persist([
        { ...draft, id: `${Date.now()}`, createdAt: Date.now() },
        ...entries,
      ]);
    },
    [entries, persist],
  );

  const deleteEntry = useCallback(
    (id: string) => persist(entries.filter((e) => e.id !== id)),
    [entries, persist],
  );

  const stats = useMemo(() => {
    const total = entries.length;
    if (total === 0) return { total: 0, winRate: 0, avgRR: "—" };
    const wins = entries.filter((e) => e.result === "win").length;
    const winRate = Math.round((wins / total) * 100);
    const rrNums = entries
      .map((e) => {
        const parts = e.riskReward.split(":");
        const n = parseFloat(parts[parts.length - 1] ?? "");
        return Number.isFinite(n) ? n : null;
      })
      .filter((n): n is number => n !== null);
    const avgRR =
      rrNums.length > 0
        ? `1:${(rrNums.reduce((a, b) => a + b, 0) / rrNums.length).toFixed(1)}`
        : "—";
    return { total, winRate, avgRR };
  }, [entries]);

  return { entries, addEntry, deleteEntry, stats };
}
