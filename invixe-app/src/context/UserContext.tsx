import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getParentLessonForSublesson } from "../modules/lessons/registry";
import { areAllSublessonsCompleted } from "../modules/lessons/lessonUtils";
import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout, FetchTimeoutError } from "../utils/fetchWithTimeout";
import { STORAGE_KEYS } from "../utils/storage";

async function withTransientRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!(error instanceof FetchTimeoutError)) throw error;
    return fn();
  }
}

interface LessonAttempt {
  lessonId: number;
  completed: boolean;
  lastAttempted: Date;
  attempts: number;
}

interface ProgressPayload {
  completedLessons: number[];
  lessonAttempts: LessonAttempt[];
  /** Persistence field — maps to cash in the app layer. */
  coins: number;
  firstName?: string | null;
  lastName?: string | null;
}

interface UserContextType {
  completedLessons: number[];
  lessonAttempts: LessonAttempt[];
  /** Portfolio cash balance (persisted as `coins` on the server). */
  cash: number;
  firstName: string | null;
  lastName: string | null;
  currentUserEmail: string | null;
  isHydrating: boolean;
  setCompletedLessons: (lessons: number[]) => Promise<void>;
  setLessonAttempts: (attempts: LessonAttempt[]) => Promise<void>;
  markLessonCompleted: (lessonId: number) => Promise<void>;
  markLessonAttempted: (lessonId: number) => void;
  setCash: (cash: number) => void;
  setCurrentUser: (
    email: string,
    profile?: { firstName?: string; lastName?: string },
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function mergeCompletedLessons(
  local: number[],
  server: number[],
): number[] {
  return [...new Set([...local, ...server])].sort((a, b) => a - b);
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [completedLessons, setCompletedLessonsState] = useState<number[]>([]);
  const [lessonAttempts, setLessonAttemptsState] = useState<LessonAttempt[]>(
    [],
  );
  const [cash, setCashState] = useState<number>(0);
  const [firstName, setFirstNameState] = useState<string | null>(null);
  const [lastName, setLastNameState] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(
    null,
  );
  const [isHydrating, setIsHydrating] = useState(true);

  const currentUserEmailRef = useRef<string | null>(null);
  const progressFetchGen = useRef(0);
  const progressSaveInFlight = useRef(0);
  const completedLessonsRef = useRef<number[]>([]);
  const lessonAttemptsRef = useRef<LessonAttempt[]>([]);

  useEffect(() => {
    currentUserEmailRef.current = currentUserEmail;
  }, [currentUserEmail]);

  useEffect(() => {
    completedLessonsRef.current = completedLessons;
  }, [completedLessons]);

  useEffect(() => {
    lessonAttemptsRef.current = lessonAttempts;
  }, [lessonAttempts]);

  const resetUserState = useCallback(() => {
    setCompletedLessonsState([]);
    setLessonAttemptsState([]);
    setCashState(0);
    setFirstNameState(null);
    setLastNameState(null);
    completedLessonsRef.current = [];
    lessonAttemptsRef.current = [];
  }, []);

  const applyProgressPayload = useCallback(
    (email: string, requestGen: number, data: ProgressPayload) => {
      if (requestGen !== progressFetchGen.current) return;
      if (email !== currentUserEmailRef.current) return;

      const serverCompleted = data.completedLessons ?? [];
      setCompletedLessonsState((prev) => {
        const next =
          progressSaveInFlight.current > 0
            ? mergeCompletedLessons(prev, serverCompleted)
            : serverCompleted;
        completedLessonsRef.current = next;
        return next;
      });

      const serverAttempts = data.lessonAttempts ?? [];
      setLessonAttemptsState((prev) => {
        const next =
          progressSaveInFlight.current > 0
            ? mergeLessonAttempts(prev, serverAttempts)
            : serverAttempts;
        lessonAttemptsRef.current = next;
        return next;
      });

      setCashState(data.coins || 0);
      if (data.firstName !== undefined) {
        setFirstNameState(data.firstName ?? null);
      }
      if (data.lastName !== undefined) {
        setLastNameState(data.lastName ?? null);
      }
    },
    [],
  );

  const fetchUserData = useCallback(
    async (email?: string) => {
      const userEmail = email ?? currentUserEmailRef.current;
      if (!userEmail) {
        resetUserState();
        return;
      }

      if (progressSaveInFlight.current > 0) {
        return;
      }

      const requestGen = ++progressFetchGen.current;

      try {
        const res = await fetchWithTimeout(
          `${API_BASE_URL}/user/progress?email=${encodeURIComponent(userEmail)}`,
        );
        if (requestGen !== progressFetchGen.current) return;
        if (userEmail !== currentUserEmailRef.current) return;
        if (!res.ok) {
          throw new Error(`Failed to fetch user data: ${res.status}`);
        }
        const data = (await res.json()) as ProgressPayload;
        applyProgressPayload(userEmail, requestGen, data);
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    },
    [applyProgressPayload, resetUserState],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(
          STORAGE_KEYS.sessionEmail,
        );
        if (cancelled) return;
        if (!savedEmail) return;

        const requestGen = ++progressFetchGen.current;
        setCurrentUserEmail(savedEmail);
        currentUserEmailRef.current = savedEmail;

        const res = await fetchWithTimeout(
          `${API_BASE_URL}/user/progress?email=${encodeURIComponent(savedEmail)}`,
        );
        if (cancelled || requestGen !== progressFetchGen.current) return;
        if (savedEmail !== currentUserEmailRef.current) return;
        if (!res.ok) return;

        const data = (await res.json()) as ProgressPayload;
        applyProgressPayload(savedEmail, requestGen, data);
      } catch (e) {
        console.error("Error restoring session:", e);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
      progressFetchGen.current += 1;
    };
  }, [applyProgressPayload]);

  const setCurrentUser = useCallback(
    async (
      email: string,
      profile?: { firstName?: string; lastName?: string },
    ) => {
      progressFetchGen.current += 1;
      resetUserState();
      setCurrentUserEmail(email);
      currentUserEmailRef.current = email;
      await AsyncStorage.setItem(STORAGE_KEYS.sessionEmail, email);
      if (profile) {
        if (profile.firstName !== undefined) {
          setFirstNameState(profile.firstName || null);
        }
        if (profile.lastName !== undefined) {
          setLastNameState(profile.lastName || null);
        }
      }
      await fetchUserData(email);
    },
    [fetchUserData, resetUserState],
  );

  const logout = useCallback(async () => {
    progressFetchGen.current += 1;
    setCurrentUserEmail(null);
    currentUserEmailRef.current = null;
    resetUserState();
    await AsyncStorage.removeItem(STORAGE_KEYS.sessionEmail);
  }, [resetUserState]);

  const persistCompletedLessons = useCallback(
    async (userEmail: string, lessons: number[]) => {
      await withTransientRetry(async () => {
        const res = await fetchWithTimeout(
          `${API_BASE_URL}/user/progress`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              completedLessons: lessons,
            }),
          },
          20_000,
        );
        if (!res.ok) {
          throw new Error(`Failed to save progress: ${res.status}`);
        }
      });
    },
    [],
  );

  const persistLessonAttempts = useCallback(
    async (userEmail: string, attempts: LessonAttempt[]) => {
      await withTransientRetry(async () => {
        const res = await fetchWithTimeout(
          `${API_BASE_URL}/user/lesson-attempts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              lessonAttempts: attempts,
            }),
          },
          20_000,
        );
        if (!res.ok) {
          throw new Error(`Failed to save lesson attempts: ${res.status}`);
        }
      });
    },
    [],
  );

  const setCompletedLessons = useCallback(
    async (lessons: number[]) => {
      const userEmail = currentUserEmailRef.current;
      setCompletedLessonsState(lessons);
      completedLessonsRef.current = lessons;
      if (!userEmail) return;

      progressSaveInFlight.current += 1;
      try {
        await persistCompletedLessons(userEmail, lessons);
      } catch (error) {
        console.error("Error saving progress:", error);
        throw error;
      } finally {
        progressSaveInFlight.current -= 1;
      }
    },
    [persistCompletedLessons],
  );

  const setLessonAttempts = useCallback(
    async (attempts: LessonAttempt[]) => {
      const userEmail = currentUserEmailRef.current;
      setLessonAttemptsState(attempts);
      lessonAttemptsRef.current = attempts;
      if (!userEmail) return;

      progressSaveInFlight.current += 1;
      try {
        await persistLessonAttempts(userEmail, attempts);
      } catch (error) {
        console.error("Error saving lesson attempts:", error);
        throw error;
      } finally {
        progressSaveInFlight.current -= 1;
      }
    },
    [persistLessonAttempts],
  );

  const markLessonCompleted = useCallback(
    async (lessonId: number) => {
      const userEmail = currentUserEmailRef.current;
      if (!userEmail) return;

      const prevAttempts = lessonAttemptsRef.current;
      const prevCompleted = completedLessonsRef.current;

      const existingAttempt = prevAttempts.find(
        (a) => a.lessonId === lessonId,
      );
      const changedAttempt: LessonAttempt = existingAttempt
        ? {
            ...existingAttempt,
            completed: true,
            lastAttempted: new Date(),
            attempts: existingAttempt.attempts + 1,
          }
        : {
            lessonId,
            completed: true,
            lastAttempted: new Date(),
            attempts: 1,
          };

      const updatedAttempts = existingAttempt
        ? prevAttempts.map((a) =>
            a.lessonId === lessonId ? changedAttempt : a,
          )
        : [...prevAttempts, changedAttempt];

      let newCompletedLessons = [...prevCompleted];
      if (!newCompletedLessons.includes(lessonId)) {
        newCompletedLessons.push(lessonId);
      }

      const parent = getParentLessonForSublesson(lessonId);
      if (parent) {
        const allDone = areAllSublessonsCompleted(parent, newCompletedLessons);
        if (allDone && !newCompletedLessons.includes(parent.id)) {
          newCompletedLessons.push(parent.id);
        }
      }

      // Server merges — only send deltas so production stays under the timeout.
      const newlyCompleted = newCompletedLessons.filter(
        (id) => !prevCompleted.includes(id),
      );

      setLessonAttemptsState(updatedAttempts);
      setCompletedLessonsState(newCompletedLessons);
      lessonAttemptsRef.current = updatedAttempts;
      completedLessonsRef.current = newCompletedLessons;

      progressSaveInFlight.current += 1;
      try {
        await Promise.all([
          persistLessonAttempts(userEmail, [changedAttempt]),
          newlyCompleted.length > 0
            ? persistCompletedLessons(userEmail, newlyCompleted)
            : Promise.resolve(),
        ]);
      } catch (error) {
        console.error("Error persisting lesson completion:", error);
        throw error;
      } finally {
        progressSaveInFlight.current -= 1;
      }
    },
    [persistCompletedLessons, persistLessonAttempts],
  );

  const markLessonAttempted = useCallback(
    (lessonId: number) => {
      const userEmail = currentUserEmailRef.current;
      const prevAttempts = lessonAttemptsRef.current;
      const existingAttempt = prevAttempts.find(
        (a) => a.lessonId === lessonId,
      );
      const changedAttempt: LessonAttempt = existingAttempt
        ? {
            ...existingAttempt,
            lastAttempted: new Date(),
            attempts: existingAttempt.attempts + 1,
          }
        : {
            lessonId,
            completed: false,
            lastAttempted: new Date(),
            attempts: 1,
          };

      const updatedAttempts = existingAttempt
        ? prevAttempts.map((a) =>
            a.lessonId === lessonId ? changedAttempt : a,
          )
        : [...prevAttempts, changedAttempt];

      setLessonAttemptsState(updatedAttempts);
      lessonAttemptsRef.current = updatedAttempts;
      if (!userEmail) return;

      // Fire-and-forget: only the changed lesson — avoids rewriting full history.
      void persistLessonAttempts(userEmail, [changedAttempt]).catch((error) => {
        console.error("Error saving lesson attempts:", error);
      });
    },
    [persistLessonAttempts],
  );

  const setCash = useCallback(async (nextCash: number) => {
    setCashState(nextCash);
    const userEmail = currentUserEmailRef.current;
    if (!userEmail) return;

    fetchWithTimeout(`${API_BASE_URL}/user/currency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, coins: nextCash }),
    }).catch((e) => console.error("Error saving cash:", e));
  }, []);

  const refreshUserData = useCallback(
    () => fetchUserData(),
    [fetchUserData],
  );

  const value = useMemo(
    () => ({
      completedLessons,
      lessonAttempts,
      cash,
      firstName,
      lastName,
      currentUserEmail,
      isHydrating,
      setCompletedLessons,
      setLessonAttempts,
      markLessonCompleted,
      markLessonAttempted,
      setCash,
      setCurrentUser,
      logout,
      refreshUserData,
    }),
    [
      completedLessons,
      lessonAttempts,
      cash,
      firstName,
      lastName,
      currentUserEmail,
      isHydrating,
      setCompletedLessons,
      setLessonAttempts,
      markLessonCompleted,
      markLessonAttempted,
      setCash,
      setCurrentUser,
      logout,
      refreshUserData,
    ],
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};

function mergeLessonAttempts(
  local: LessonAttempt[],
  server: LessonAttempt[],
): LessonAttempt[] {
  const byId = new Map<number, LessonAttempt>();
  for (const attempt of server) {
    byId.set(attempt.lessonId, attempt);
  }
  for (const attempt of local) {
    const existing = byId.get(attempt.lessonId);
    if (!existing) {
      byId.set(attempt.lessonId, attempt);
      continue;
    }
    const localTime = new Date(attempt.lastAttempted).getTime();
    const serverTime = new Date(existing.lastAttempted).getTime();
    byId.set(attempt.lessonId, {
      lessonId: attempt.lessonId,
      completed: existing.completed || attempt.completed,
      attempts: Math.max(existing.attempts, attempt.attempts),
      lastAttempted: new Date(Math.max(localTime, serverTime)),
    });
  }
  return [...byId.values()];
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
