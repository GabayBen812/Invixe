import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LessonStep, StepRegistry } from "../modules/lessons/types";
import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { getCachedRegistry, setCachedRegistry } from "../utils/storage";

type LessonsContextType = {
  lessonsRegistry: StepRegistry[];
  loadingRegistry: boolean;
  getLessonSteps: (lessonId: number, unitId?: string) => Promise<LessonStep[]>;
};

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

const API_BASE = API_BASE_URL;

function normalizeRegistry(data: unknown): StepRegistry[] {
  return ((data as StepRegistry[]) || []).map((step) => {
    const raw = step as StepRegistry & {
      unitid?: string;
      unit_id?: string;
    };
    return {
      ...raw,
      unitId: raw.unitId ?? raw.unitid ?? raw.unit_id,
    };
  });
}

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const [lessonsRegistry, setLessonsRegistry] = useState<StepRegistry[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(true);
  const stepsCacheRef = useRef<Record<string, LessonStep[]>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadRegistry() {
      const cached = await getCachedRegistry<StepRegistry[]>();
      if (cached?.length && !cancelled) {
        setLessonsRegistry(cached);
        setLoadingRegistry(false);
      }

      try {
        const res = await fetchWithTimeout(`${API_BASE}/v2/lessons/registry`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        const normalized = normalizeRegistry(data);
        if (!cancelled) {
          setLessonsRegistry(normalized);
          void setCachedRegistry(normalized);
        }
      } catch (e) {
        console.error("Failed to load lessons registry", e);
        if (!cancelled && !cached?.length) {
          setLessonsRegistry([]);
        }
      } finally {
        if (!cancelled) setLoadingRegistry(false);
      }
    }

    loadRegistry();
    return () => {
      cancelled = true;
    };
  }, []);

  const getLessonSteps = useCallback(
    async (lessonId: number, unitId?: string): Promise<LessonStep[]> => {
      const cacheKey = unitId ? `${unitId}:${lessonId}` : `${lessonId}`;
      const cached = stepsCacheRef.current[cacheKey];
      if (cached) return cached;

      try {
        const url = unitId
          ? `${API_BASE}/v2/lessons/${lessonId}/steps?unitId=${encodeURIComponent(unitId)}`
          : `${API_BASE}/v2/lessons/${lessonId}/steps`;
        const res = await fetchWithTimeout(url);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as LessonStep[];
        const steps = data || [];
        stepsCacheRef.current[cacheKey] = steps;
        return steps;
      } catch (e) {
        console.error("Failed to load lesson steps", lessonId, e);
        return [];
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ lessonsRegistry, loadingRegistry, getLessonSteps }),
    [lessonsRegistry, loadingRegistry, getLessonSteps],
  );

  return (
    <LessonsContext.Provider value={value}>
      {children}
    </LessonsContext.Provider>
  );
}

export function useLessons() {
  const ctx = useContext(LessonsContext);
  if (!ctx) throw new Error("useLessons must be used within LessonsProvider");
  return ctx;
}
