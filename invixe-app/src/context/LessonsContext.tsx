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
import { normalizeLessonType } from "../modules/lessons/lessonTheme";
import { sanitizeLessonContent } from "../utils/decodeHtmlEntities";
import { normalizeLessonSteps } from "../modules/lessons/lessonUtils";
import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import {
  getCachedRegistry,
  getStaleRegistry,
  setCachedRegistry,
} from "../utils/storage";

type LessonsContextType = {
  lessonsRegistry: StepRegistry[];
  loadingRegistry: boolean;
  registryError: string | null;
  refreshRegistry: () => Promise<void>;
  getLessonSteps: (lessonId: number, unitId?: string) => Promise<LessonStep[]>;
};

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

const API_BASE = API_BASE_URL;

function normalizeLessonEntry<T extends { lessonType?: string; title?: string }>(
  entry: T,
): T {
  return {
    ...entry,
    lessonType: normalizeLessonType(entry.lessonType, entry.title) as T["lessonType"],
  };
}

function normalizeRegistry(data: unknown): StepRegistry[] {
  return ((data as StepRegistry[]) || []).map((step) => {
    const raw = step as StepRegistry & {
      unitid?: string;
      unit_id?: string;
    };
    return {
      ...raw,
      unitId: raw.unitId ?? raw.unitid ?? raw.unit_id,
      title: raw.title,
      description: raw.description,
      lessons: (raw.lessons || []).map((lesson) => ({
        ...normalizeLessonEntry(lesson),
        sublessons: (lesson.sublessons || []).map((sub) => normalizeLessonEntry(sub)),
      })),
    };
  });
}

const REGISTRY_FETCH_TIMEOUT_MS = 20_000;
const REGISTRY_MAX_ATTEMPTS = 3;
const REGISTRY_RETRY_DELAY_MS = 1_500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const [lessonsRegistry, setLessonsRegistry] = useState<StepRegistry[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(true);
  const [registryError, setRegistryError] = useState<string | null>(null);
  const stepsCacheRef = useRef<Record<string, LessonStep[]>>({});
  const loadRequestIdRef = useRef(0);

  const refreshRegistry = useCallback(async () => {
    const requestId = ++loadRequestIdRef.current;
    setLoadingRegistry(true);
    setRegistryError(null);

    const cached = await getCachedRegistry<StepRegistry[]>();
    if (requestId !== loadRequestIdRef.current) return;
    if (cached?.length) {
      setLessonsRegistry(cached);
    }

    let lastError: unknown = null;

    for (let attempt = 1; attempt <= REGISTRY_MAX_ATTEMPTS; attempt += 1) {
      try {
        const res = await fetchWithTimeout(
          `${API_BASE}/v2/lessons/registry`,
          undefined,
          REGISTRY_FETCH_TIMEOUT_MS,
        );
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        const normalized = normalizeRegistry(data);
        if (requestId !== loadRequestIdRef.current) return;
        if (!normalized.length) throw new Error("empty registry");
        setLessonsRegistry(normalized);
        setRegistryError(null);
        void setCachedRegistry(normalized);
        setLoadingRegistry(false);
        return;
      } catch (e) {
        lastError = e;
        console.error(
          `Failed to load lessons registry (attempt ${attempt}/${REGISTRY_MAX_ATTEMPTS})`,
          e,
        );
        if (attempt < REGISTRY_MAX_ATTEMPTS) {
          await delay(REGISTRY_RETRY_DELAY_MS * attempt);
          if (requestId !== loadRequestIdRef.current) return;
        }
      }
    }

    if (requestId !== loadRequestIdRef.current) return;

    const stale = await getStaleRegistry<StepRegistry[]>();
    if (stale?.length) {
      setLessonsRegistry(stale);
      setRegistryError(null);
    } else if (!cached?.length) {
      setLessonsRegistry([]);
      setRegistryError(
        lastError instanceof Error
          ? lastError.message
          : "Failed to load courses",
      );
    }
    setLoadingRegistry(false);
  }, []);

  useEffect(() => {
    void refreshRegistry();
  }, [refreshRegistry]);

  const getLessonSteps = useCallback(
    async (lessonId: number, unitId?: string): Promise<LessonStep[]> => {
      const cacheKey = unitId ? `${unitId}:${lessonId}` : `${lessonId}`;
      const cached = stepsCacheRef.current[cacheKey];
      if (cached) return sanitizeLessonContent(cached);

      try {
        const url = unitId
          ? `${API_BASE}/v2/lessons/${lessonId}/steps?unitId=${encodeURIComponent(unitId)}`
          : `${API_BASE}/v2/lessons/${lessonId}/steps`;
        const res = await fetchWithTimeout(url);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as LessonStep[];
        const steps = normalizeLessonSteps(sanitizeLessonContent(data || []));
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
    () => ({
      lessonsRegistry,
      loadingRegistry,
      registryError,
      refreshRegistry,
      getLessonSteps,
    }),
    [
      lessonsRegistry,
      loadingRegistry,
      registryError,
      refreshRegistry,
      getLessonSteps,
    ],
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
