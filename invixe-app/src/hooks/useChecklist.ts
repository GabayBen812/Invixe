import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../context/UserContext";

export type ChecklistItem = {
  id: string;
  text: string;
  state: "pending" | "completed" | "failed";
};

const DEFAULTS: ChecklistItem[] = [
  { id: "d1", text: "לונג בלבד", state: "pending" },
  { id: "d2", text: "טרנד שורי לפי ממוצע נע 150", state: "pending" },
  { id: "d3", text: "חזרה לאזור ממוצע נע 150", state: "pending" },
  { id: "d4", text: "אין התנגדות קרובה מעל המחיר", state: "pending" },
  { id: "d5", text: "יש מומנטום חזק", state: "pending" },
  { id: "d6", text: "סטופ לוס מתחת לתמיכה", state: "pending" },
  { id: "d7", text: "טייק פרופיט מוגדר מראש", state: "pending" },
];

function storageKey(email: string | null) {
  return email
    ? `@invixe/checklist_v1:${email}`
    : "@invixe/checklist_v1:guest";
}

export function useChecklist() {
  const { currentUserEmail } = useUser();
  const key = storageKey(currentUserEmail);

  const [items, setItems] = useState<ChecklistItem[]>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key).then((raw) => {
      if (cancelled) return;
      if (raw) {
        try {
          setItems(JSON.parse(raw) as ChecklistItem[]);
          return;
        } catch {}
      }
      setItems(DEFAULTS);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const persist = useCallback(
    (next: ChecklistItem[]) => {
      setItems(next);
      void AsyncStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );

  const setItemState = useCallback(
    (id: string, state: ChecklistItem["state"]) =>
      persist(
        items.map((item) => (item.id === id ? { ...item, state } : item)),
      ),
    [items, persist],
  );

  const addItem = useCallback(
    (text: string) =>
      persist([
        ...items,
        { id: `${Date.now()}`, text: text.trim(), state: "pending" },
      ]),
    [items, persist],
  );

  const deleteItem = useCallback(
    (id: string) => persist(items.filter((item) => item.id !== id)),
    [items, persist],
  );

  const resetAll = useCallback(
    () =>
      persist(items.map((item) => ({ ...item, state: "pending" as const }))),
    [items, persist],
  );

  const completed = items.filter((i) => i.state === "completed").length;

  return { items, setItemState, addItem, deleteItem, resetAll, completed };
}
