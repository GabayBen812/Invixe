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
import { STORAGE_KEYS, profileAvatarKey } from "../utils/storage";

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
  /**
   * Positive delta just awarded (correct answer / lesson complete / ad).
   * TopBar consumes this to run the count-up animation, then clearCashGain.
   */
  cashGain: number;
  firstName: string | null;
  lastName: string | null;
  currentUserEmail: string | null;
  /** Ephemeral App Store guest session — no server sync, cleared on app restart. */
  isGuest: boolean;
  isHydrating: boolean;
  setCompletedLessons: (lessons: number[]) => Promise<void>;
  setLessonAttempts: (attempts: LessonAttempt[]) => Promise<void>;
  markLessonCompleted: (lessonId: number) => Promise<void>;
  markLessonAttempted: (lessonId: number) => void;
  setCash: (cash: number) => void;
  /** Award cash (persists via /user/add-coins) and trigger TopBar rise animation. */
  addCash: (amount: number) => Promise<number>;
  clearCashGain: () => void;
  setCurrentUser: (
    email: string,
    profile?: { firstName?: string; lastName?: string },
  ) => Promise<void>;
  enterGuestMode: () => void;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateProfileName: (
    firstName: string,
    lastName?: string,
  ) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
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
  const [cashGain, setCashGain] = useState(0);
  const [firstName, setFirstNameState] = useState<string | null>(null);
  const [lastName, setLastNameState] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(
    null,
  );
  const [isGuest, setIsGuest] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  const currentUserEmailRef = useRef<string | null>(null);
  const isGuestRef = useRef(false);
  const progressFetchGen = useRef(0);
  const progressSaveInFlight = useRef(0);
  const completedLessonsRef = useRef<number[]>([]);
  const lessonAttemptsRef = useRef<LessonAttempt[]>([]);
  const cashRef = useRef(0);
  /** After first hydrate, ignore silent currency snaps from progress polling. */
  const cashHydratedRef = useRef(false);

  useEffect(() => {
    currentUserEmailRef.current = currentUserEmail;
  }, [currentUserEmail]);

  useEffect(() => {
    isGuestRef.current = isGuest;
  }, [isGuest]);

  useEffect(() => {
    completedLessonsRef.current = completedLessons;
  }, [completedLessons]);

  useEffect(() => {
    lessonAttemptsRef.current = lessonAttempts;
  }, [lessonAttempts]);

  useEffect(() => {
    cashRef.current = cash;
  }, [cash]);

  const resetUserState = useCallback(() => {
    setCompletedLessonsState([]);
    setLessonAttemptsState([]);
    setCashState(0);
    setCashGain(0);
    setFirstNameState(null);
    setLastNameState(null);
    completedLessonsRef.current = [];
    lessonAttemptsRef.current = [];
    cashRef.current = 0;
    cashHydratedRef.current = false;
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

      // Only sync cash on first hydrate / login — later progress fetches must not
      // jump the TopBar without an intentional award animation.
      if (!cashHydratedRef.current) {
        const nextCash = data.coins || 0;
        cashRef.current = nextCash;
        setCashState(nextCash);
        cashHydratedRef.current = true;
      }
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
      setIsGuest(false);
      isGuestRef.current = false;
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

  const enterGuestMode = useCallback(() => {
    progressFetchGen.current += 1;
    setIsGuest(true);
    isGuestRef.current = true;
    setCurrentUserEmail(null);
    currentUserEmailRef.current = null;
    resetUserState();
  }, [resetUserState]);

  const logout = useCallback(async () => {
    progressFetchGen.current += 1;
    setIsGuest(false);
    isGuestRef.current = false;
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
      if (isGuestRef.current || !userEmail) return;

      setCompletedLessonsState(lessons);
      completedLessonsRef.current = lessons;

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
      if (isGuestRef.current || !userEmail) return;

      setLessonAttemptsState(attempts);
      lessonAttemptsRef.current = attempts;

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
      if (!userEmail || isGuestRef.current) return;

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
      if (!userEmail || isGuestRef.current) return;
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
    if (isGuestRef.current) return;
    cashRef.current = nextCash;
    cashHydratedRef.current = true;
    setCashState(nextCash);
    const userEmail = currentUserEmailRef.current;
    if (!userEmail) return;

    fetchWithTimeout(`${API_BASE_URL}/user/currency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, coins: nextCash }),
    }).catch((e) => console.error("Error saving cash:", e));
  }, []);

  const clearCashGain = useCallback(() => {
    setCashGain(0);
  }, []);

  const addCash = useCallback(async (amount: number) => {
    const safeAmount = Math.max(0, Math.round(amount));
    if (safeAmount <= 0) return cashRef.current;

    if (isGuestRef.current) return cashRef.current;

    const userEmail = currentUserEmailRef.current;
    const optimistic = cashRef.current + safeAmount;
    cashRef.current = optimistic;
    cashHydratedRef.current = true;
    setCashState(optimistic);
    setCashGain(safeAmount);

    if (!userEmail) return optimistic;

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/user/add-coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, coins: safeAmount }),
      });
      if (!res.ok) {
        throw new Error(`Failed to add cash: ${res.status}`);
      }
      const data = (await res.json()) as { newCoins?: number };
      if (typeof data.newCoins === "number") {
        cashRef.current = data.newCoins;
        setCashState(data.newCoins);
        return data.newCoins;
      }
    } catch (e) {
      console.error("Error adding cash:", e);
    }
    return optimistic;
  }, []);

  const refreshUserData = useCallback(
    () => fetchUserData(),
    [fetchUserData],
  );

  const updateProfileName = useCallback(
    async (nextFirstName: string, nextLastName?: string) => {
      const userEmail = currentUserEmailRef.current;
      const trimmedFirst = nextFirstName.trim();
      const trimmedLast = nextLastName?.trim() || "";
      if (!userEmail || !trimmedFirst) return false;

      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}/user/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            firstName: trimmedFirst,
            lastName: trimmedLast || undefined,
          }),
        });
        if (!res.ok) return false;

        const data = (await res.json()) as {
          firstName?: string;
          lastName?: string | null;
        };
        setFirstNameState(data.firstName?.trim() || trimmedFirst);
        setLastNameState(data.lastName?.trim() || trimmedLast || null);
        return true;
      } catch (e) {
        console.error("Error updating profile name:", e);
        return false;
      }
    },
    [],
  );

  const deleteAccount = useCallback(async () => {
    const userEmail = currentUserEmailRef.current;
    if (!userEmail) return false;

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/user/delete-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!res.ok) return false;

      try {
        await AsyncStorage.removeItem(profileAvatarKey(userEmail));
      } catch {
        // ignore local cleanup failures
      }

      progressFetchGen.current += 1;
      setIsGuest(false);
      isGuestRef.current = false;
      setCurrentUserEmail(null);
      currentUserEmailRef.current = null;
      resetUserState();
      await AsyncStorage.removeItem(STORAGE_KEYS.sessionEmail);
      return true;
    } catch (e) {
      console.error("Error deleting account:", e);
      return false;
    }
  }, [resetUserState]);

  const value = useMemo(
    () => ({
      completedLessons,
      lessonAttempts,
      cash,
      cashGain,
      firstName,
      lastName,
      currentUserEmail,
      isGuest,
      isHydrating,
      setCompletedLessons,
      setLessonAttempts,
      markLessonCompleted,
      markLessonAttempted,
      setCash,
      addCash,
      clearCashGain,
      setCurrentUser,
      enterGuestMode,
      logout,
      refreshUserData,
      updateProfileName,
      deleteAccount,
    }),
    [
      completedLessons,
      lessonAttempts,
      cash,
      cashGain,
      firstName,
      lastName,
      currentUserEmail,
      isGuest,
      isHydrating,
      setCompletedLessons,
      setLessonAttempts,
      markLessonCompleted,
      markLessonAttempted,
      setCash,
      addCash,
      clearCashGain,
      setCurrentUser,
      enterGuestMode,
      logout,
      refreshUserData,
      updateProfileName,
      deleteAccount,
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
