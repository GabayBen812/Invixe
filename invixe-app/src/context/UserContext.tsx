import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getParentLessonForSublesson } from "../modules/lessons/registry";
import { areAllSublessonsCompleted } from "../modules/lessons/lessonUtils";
import { API_BASE_URL } from "../config/api";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { STORAGE_KEYS } from "../utils/storage";

interface LessonAttempt {
  lessonId: number;
  completed: boolean;
  lastAttempted: Date;
  attempts: number;
}

interface UserContextType {
  completedLessons: number[];
  lessonAttempts: LessonAttempt[];
  coins: number;
  lightnings: number;
  firstName: string | null;
  lastName: string | null;
  currentUserEmail: string | null;
  isHydrating: boolean;
  setCompletedLessons: (lessons: number[]) => Promise<void>;
  setLessonAttempts: (attempts: LessonAttempt[]) => Promise<void>;
  markLessonCompleted: (lessonId: number) => Promise<void>;
  markLessonAttempted: (lessonId: number) => void;
  setCoins: (coins: number) => void;
  setLightnings: (lightnings: number) => void;
  setCurrentUser: (
    email: string,
    profile?: { firstName?: string; lastName?: string },
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [completedLessons, setCompletedLessonsState] = useState<number[]>([]);
  const [lessonAttempts, setLessonAttemptsState] = useState<LessonAttempt[]>(
    [],
  );
  const [coins, setCoinsState] = useState<number>(0);
  const [lightnings, setLightningsState] = useState<number>(0);
  const [firstName, setFirstNameState] = useState<string | null>(null);
  const [lastName, setLastNameState] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(
    null,
  );
  const [isHydrating, setIsHydrating] = useState(true);

  const fetchUserData = useCallback(async (email?: string) => {
    try {
      const userEmail = email ?? currentUserEmail;
      if (!userEmail) {
        setCompletedLessonsState([]);
        setLessonAttemptsState([]);
        setCoinsState(0);
        setLightningsState(0);
        setFirstNameState(null);
        setLastNameState(null);
        return;
      }

      const res = await fetchWithTimeout(
        `${API_BASE_URL}/user/progress?email=${encodeURIComponent(userEmail)}`,
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch user data: ${res.status}`);
      }
      const data = await res.json();
      setCompletedLessonsState(data.completedLessons || []);
      setLessonAttemptsState(data.lessonAttempts || []);
      setCoinsState(data.coins || 0);
      setLightningsState(data.lightnings || 0);
      setFirstNameState((prev) => data.firstName ?? prev ?? null);
      setLastNameState((prev) => data.lastName ?? prev ?? null);
    } catch (e) {
      console.error("Error fetching user data:", e);
    }
  }, [currentUserEmail]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(
          STORAGE_KEYS.sessionEmail,
        );
        if (cancelled || !savedEmail) return;

        setCurrentUserEmail(savedEmail);
        const res = await fetchWithTimeout(
          `${API_BASE_URL}/user/progress?email=${encodeURIComponent(savedEmail)}`,
        );
        if (cancelled || !res.ok) return;
        const data = await res.json();
        setCompletedLessonsState(data.completedLessons || []);
        setLessonAttemptsState(data.lessonAttempts || []);
        setCoinsState(data.coins || 0);
        setLightningsState(data.lightnings || 0);
        setFirstNameState(data.firstName ?? null);
        setLastNameState(data.lastName ?? null);
      } catch (e) {
        console.error("Error restoring session:", e);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrentUser = useCallback(
    async (
      email: string,
      profile?: { firstName?: string; lastName?: string },
    ) => {
      setCurrentUserEmail(email);
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
    [fetchUserData],
  );

  const logout = useCallback(async () => {
    setCurrentUserEmail(null);
    setCompletedLessonsState([]);
    setLessonAttemptsState([]);
    setCoinsState(0);
    setLightningsState(0);
    setFirstNameState(null);
    setLastNameState(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.sessionEmail);
  }, []);

  const setCompletedLessons = useCallback(
    async (lessons: number[]) => {
      setCompletedLessonsState(lessons);
      const userEmail = currentUserEmail;
      if (!userEmail) return;

      try {
        const res = await fetchWithTimeout(`${API_BASE_URL}/user/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            completedLessons: lessons,
          }),
        });
        if (!res.ok) {
          throw new Error(`Failed to save progress: ${res.status}`);
        }
      } catch (error) {
        console.error("Error saving progress:", error);
        throw error;
      }
    },
    [currentUserEmail],
  );

  const setLessonAttempts = useCallback(
    async (attempts: LessonAttempt[]) => {
      setLessonAttemptsState(attempts);
      const userEmail = currentUserEmail;
      if (!userEmail) return;

      try {
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
        );
        if (!res.ok) {
          throw new Error(`Failed to save lesson attempts: ${res.status}`);
        }
      } catch (error) {
        console.error("Error saving lesson attempts:", error);
        throw error;
      }
    },
    [currentUserEmail],
  );

  const markLessonCompleted = useCallback(
    async (lessonId: number) => {
      const existingAttempt = lessonAttempts.find(
        (a) => a.lessonId === lessonId,
      );
      const updatedAttempts = [...lessonAttempts];

      if (existingAttempt) {
        const index = updatedAttempts.findIndex(
          (a) => a.lessonId === lessonId,
        );
        updatedAttempts[index] = {
          ...existingAttempt,
          completed: true,
          lastAttempted: new Date(),
          attempts: existingAttempt.attempts + 1,
        };
      } else {
        updatedAttempts.push({
          lessonId,
          completed: true,
          lastAttempted: new Date(),
          attempts: 1,
        });
      }

      let newCompletedLessons = [...completedLessons];
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

      setLessonAttemptsState(updatedAttempts);
      setCompletedLessonsState(newCompletedLessons);

      try {
        await Promise.all([
          setLessonAttempts(updatedAttempts),
          setCompletedLessons(newCompletedLessons),
        ]);
      } catch (error) {
        console.error("Error persisting lesson completion:", error);
        throw error;
      }
    },
    [lessonAttempts, completedLessons, setLessonAttempts, setCompletedLessons],
  );

  const persistLessonAttempts = useCallback(
    (attempts: LessonAttempt[]) => {
      setLessonAttemptsState(attempts);
      const userEmail = currentUserEmail;
      if (!userEmail) return;

      fetchWithTimeout(`${API_BASE_URL}/user/lesson-attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          lessonAttempts: attempts,
        }),
      }).catch((error) => {
        console.error("Error saving lesson attempts:", error);
      });
    },
    [currentUserEmail],
  );

  const markLessonAttempted = useCallback(
    (lessonId: number) => {
      const existingAttempt = lessonAttempts.find(
        (a) => a.lessonId === lessonId,
      );
      const updatedAttempts = [...lessonAttempts];

      if (existingAttempt) {
        const index = updatedAttempts.findIndex(
          (a) => a.lessonId === lessonId,
        );
        updatedAttempts[index] = {
          ...existingAttempt,
          lastAttempted: new Date(),
          attempts: existingAttempt.attempts + 1,
        };
      } else {
        updatedAttempts.push({
          lessonId,
          completed: false,
          lastAttempted: new Date(),
          attempts: 1,
        });
      }

      persistLessonAttempts(updatedAttempts);
    },
    [lessonAttempts, persistLessonAttempts],
  );

  const setCoins = useCallback(
    async (nextCoins: number) => {
      setCoinsState(nextCoins);
      const userEmail = currentUserEmail;
      if (!userEmail) return;

      fetchWithTimeout(`${API_BASE_URL}/user/currency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, coins: nextCoins }),
      }).catch((e) => console.error("Error saving coins:", e));
    },
    [currentUserEmail],
  );

  const setLightnings = useCallback(
    async (nextLightnings: number) => {
      setLightningsState(nextLightnings);
      const userEmail = currentUserEmail;
      if (!userEmail) return;

      fetchWithTimeout(`${API_BASE_URL}/user/currency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          lightnings: nextLightnings,
        }),
      }).catch((e) => console.error("Error saving lightnings:", e));
    },
    [currentUserEmail],
  );

  const refreshUserData = useCallback(
    () => fetchUserData(),
    [fetchUserData],
  );

  const value = useMemo(
    () => ({
      completedLessons,
      lessonAttempts,
      coins,
      lightnings,
      firstName,
      lastName,
      currentUserEmail,
      isHydrating,
      setCompletedLessons,
      setLessonAttempts,
      markLessonCompleted,
      markLessonAttempted,
      setCoins,
      setLightnings,
      setCurrentUser,
      logout,
      refreshUserData,
    }),
    [
      completedLessons,
      lessonAttempts,
      coins,
      lightnings,
      firstName,
      lastName,
      currentUserEmail,
      isHydrating,
      setCompletedLessons,
      setLessonAttempts,
      markLessonCompleted,
      markLessonAttempted,
      setCoins,
      setLightnings,
      setCurrentUser,
      logout,
      refreshUserData,
    ],
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
