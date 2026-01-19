import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DictionaryContextType {
  isDictionaryOpen: boolean;
  currentTopic: string | null;
  openDictionary: (initialTopic?: string, suggestedTermId?: string) => void;
  closeDictionary: () => void;
  suggestedTermId: string | null;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [suggestedTermId, setSuggestedTermId] = useState<string | null>(null);

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
