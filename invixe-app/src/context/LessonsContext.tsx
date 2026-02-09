import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StepRegistry } from '../modules/lessons/registry';
import { LessonStep } from '../modules/lessons/types';
import { API_BASE_URL } from '../config/api';

type LessonsContextType = {
  lessonsRegistry: StepRegistry[];
  loadingRegistry: boolean;
  getLessonSteps: (lessonId: number, unitId?: string) => Promise<LessonStep[]>;
};

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

const API_BASE = API_BASE_URL;

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const [lessonsRegistry, setLessonsRegistry] = useState<StepRegistry[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState<boolean>(false);
  const [stepsCache, setStepsCache] = useState<Record<string, LessonStep[]>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;
    async function loadRegistry() {
      try {
        setLoadingRegistry(true);
        const res = await fetch(`${API_BASE}/v2/lessons/registry`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        const normalized: StepRegistry[] = (data || []).map((step: any) => ({
          ...step,
          unitId: step.unitId ?? step.unitid ?? step.unit_id ?? null,
        }));
        if (!cancelled) setLessonsRegistry(normalized);
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

  const getLessonSteps = async (
    lessonId: number,
    unitId?: string,
  ): Promise<LessonStep[]> => {
    const cacheKey = unitId ? `${unitId}:${lessonId}` : `${lessonId}`;
    if (stepsCache[cacheKey]) return stepsCache[cacheKey];
    try {
      const url = unitId
        ? `${API_BASE}/v2/lessons/${lessonId}/steps?unitId=${encodeURIComponent(
            unitId,
          )}`
        : `${API_BASE}/v2/lessons/${lessonId}/steps`;
      console.log("Fetching lesson steps", { lessonId, unitId, url });
      const res = await fetch(url);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as LessonStep[];
      setStepsCache((prev) => ({ ...prev, [cacheKey]: data || [] }));
      return data || [];
    } catch (e) {
      console.error('Failed to load lesson steps', lessonId, e);
      return [];
    }
  };

  const value = useMemo(
    () => ({ lessonsRegistry, loadingRegistry, getLessonSteps }),
    [lessonsRegistry, loadingRegistry],
  );

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


