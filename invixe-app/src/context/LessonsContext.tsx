import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StepRegistry } from '../modules/lessons/registry';
import { LessonStep } from '../modules/lessons/types';

type LessonsContextType = {
  lessonsRegistry: StepRegistry[];
  loadingRegistry: boolean;
  getLessonSteps: (lessonId: number) => Promise<LessonStep[]>;
};

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

const API_BASE = 'http://10.0.0.8:4000/api';

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const [lessonsRegistry, setLessonsRegistry] = useState<StepRegistry[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState<boolean>(false);
  const [stepsCache, setStepsCache] = useState<Record<number, LessonStep[]>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadRegistry() {
      try {
        setLoadingRegistry(true);
        const res = await fetch(`${API_BASE}/v2/lessons/registry`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (!cancelled) setLessonsRegistry(data || []);
      } catch (e) {
        console.error('Failed to load lessons registry', e);
        if (!cancelled) setLessonsRegistry([]);
      } finally {
        if (!cancelled) setLoadingRegistry(false);
      }
    }
    loadRegistry();
    return () => { cancelled = true; };
  }, []);

  const getLessonSteps = async (lessonId: number): Promise<LessonStep[]> => {
    if (stepsCache[lessonId]) return stepsCache[lessonId];
    try {
      const res = await fetch(`${API_BASE}/v2/lessons/${lessonId}/steps`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as LessonStep[];
      setStepsCache(prev => ({ ...prev, [lessonId]: data || [] }));
      return data || [];
    } catch (e) {
      console.error('Failed to load lesson steps', lessonId, e);
      return [];
    }
  };

  const value = useMemo(() => ({ lessonsRegistry, loadingRegistry, getLessonSteps }), [lessonsRegistry, loadingRegistry]);

  return (
    <LessonsContext.Provider value={value}>
      {children}
    </LessonsContext.Provider>
  );
}

export function useLessons() {
  const ctx = useContext(LessonsContext);
  if (!ctx) throw new Error('useLessons must be used within LessonsProvider');
  return ctx;
}


