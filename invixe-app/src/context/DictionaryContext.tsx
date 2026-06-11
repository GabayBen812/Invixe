import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';
import type { DictionaryUnlockMap } from '../data/dictionary';

export interface DictionaryContextType {
  isDictionaryOpen: boolean;
  currentTopic: string | null;
  openDictionary: (initialTopic?: string, suggestedTermId?: string) => void;
  closeDictionary: () => void;
  suggestedTermId: string | null;
  /** entryId -> lesson codes that unlock it (from backend). Empty until loaded. */
  unlockMap: DictionaryUnlockMap;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [suggestedTermId, setSuggestedTermId] = useState<string | null>(null);
  const [unlockMap, setUnlockMap] = useState<DictionaryUnlockMap>({});

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v2/lessons/dictionary-unlocks`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as DictionaryUnlockMap;
        if (!cancelled && data && typeof data === 'object') {
          setUnlockMap(data);
        }
      } catch {
        // Offline / pre-deploy: keep empty map, components fall back to
        // the static unlockedByLesson values in dictionary.ts.
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const openDictionary = (initialTopic?: string, termId?: string) => {
    setCurrentTopic(initialTopic || null);
    setSuggestedTermId(termId || null);
    setIsDictionaryOpen(true);
  };

  const closeDictionary = () => {
    setIsDictionaryOpen(false);
    setCurrentTopic(null);
    setSuggestedTermId(null);
  };

  return (
    <DictionaryContext.Provider
      value={{
        isDictionaryOpen,
        currentTopic,
        openDictionary,
        closeDictionary,
        suggestedTermId,
        unlockMap,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const ctx = useContext(DictionaryContext);
  if (!ctx) throw new Error('useDictionary must be used within a DictionaryProvider');
  return ctx;
}
