import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getParentLessonForSublesson,
  areAllSublessonsCompleted,
} from "../modules/lessons/registry";
import { API_BASE_URL } from "../config/api";

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
  setCompletedLessons: (lessons: number[]) => void;
  setLessonAttempts: (attempts: LessonAttempt[]) => void;
  markLessonCompleted: (lessonId: number) => void;
  markLessonAttempted: (lessonId: number) => void;
  setCoins: (coins: number) => void;
  setLightnings: (lightnings: number) => void;
  setCurrentUser: (
    email: string,
    profile?: { firstName?: string; lastName?: string },
  ) => void;
  logout: () => void;
  refreshUserData: () => void;
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
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Fetch user data from backend
  const fetchUserData = async (email?: string) => {
    try {
      const userEmail = email || currentUserEmail;
      if (!userEmail) {
        // No email, clear data (guest mode)
        setCompletedLessonsState([]);
        setLessonAttemptsState([]);
        setCoinsState(0);
        setLightningsState(0);
        setFirstNameState(null);
        setLastNameState(null);
        return;
      }

      const res = await fetch(
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
      // Keep empty if fetch fails
      setCompletedLessonsState([]);
      setLessonAttemptsState([]);
      setCoinsState(0);
      setLightningsState(0);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Set current user and fetch their data
  const setCurrentUser = async (
    email: string,
    profile?: { firstName?: string; lastName?: string },
  ) => {
    setCurrentUserEmail(email);
    if (profile) {
      if (profile.firstName !== undefined) {
        setFirstNameState(profile.firstName || null);
      }
      if (profile.lastName !== undefined) {
        setLastNameState(profile.lastName || null);
      }
    }
    await fetchUserData(email);
  };

  const logout = () => {
    setCurrentUserEmail(null);
    setCompletedLessonsState([]);
    setLessonAttemptsState([]);
    setCoinsState(0);
    setLightningsState(0);
    setFirstNameState(null);
    setLastNameState(null);
  };

  // Update progress in backend
  const setCompletedLessons = async (lessons: number[]) => {
    try {
      setCompletedLessonsState(lessons);
      const userEmail = currentUserEmail;
      // If guest, don't save to backend
      if (!userEmail) return;

      const res = await fetch(`${API_BASE_URL}/user/progress`, {
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
  };

  // Update lesson attempts in backend
  const setLessonAttempts = async (attempts: LessonAttempt[]) => {
    try {
      setLessonAttemptsState(attempts);
      const userEmail = currentUserEmail;
      const res = await fetch(`${API_BASE_URL}/user/lesson-attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          lessonAttempts: attempts,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save lesson attempts: ${res.status}`);
      }
    } catch (error) {
      console.error("Error saving lesson attempts:", error);
      throw error;
    }
  };

  // Mark a lesson as completed
  const markLessonCompleted = async (lessonId: number) => {
    const existingAttempt = lessonAttempts.find((a) => a.lessonId === lessonId);
    const updatedAttempts = [...lessonAttempts];

    if (existingAttempt) {
      const index = updatedAttempts.findIndex((a) => a.lessonId === lessonId);
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

    await setLessonAttempts(updatedAttempts);

    // Update completed lessons list (and parent lesson if all sublessons done)
    let newCompletedLessons = [...completedLessons];
    if (!newCompletedLessons.includes(lessonId)) {
      newCompletedLessons.push(lessonId);
    }

    // If this is a sublesson, check if its parent lesson can be marked completed
    const parent = getParentLessonForSublesson(lessonId);
    if (parent) {
      const allDone = areAllSublessonsCompleted(parent, newCompletedLessons);
      if (allDone && !newCompletedLessons.includes(parent.id)) {
        newCompletedLessons.push(parent.id);
      }
    }

    await setCompletedLessons(newCompletedLessons);
  };

  // Mark a lesson as attempted (for re-taking)
  const markLessonAttempted = async (lessonId: number) => {
    const existingAttempt = lessonAttempts.find((a) => a.lessonId === lessonId);
    const updatedAttempts = [...lessonAttempts];

    if (existingAttempt) {
      const index = updatedAttempts.findIndex((a) => a.lessonId === lessonId);
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

    await setLessonAttempts(updatedAttempts);
  };

  // Update coins in backend
  const setCoins = async (coins: number) => {
    setCoinsState(coins);
    const userEmail = currentUserEmail;
    await fetch(`${API_BASE_URL}/user/currency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, coins }),
    });
  };

  // Update lightnings in backend
  const setLightnings = async (lightnings: number) => {
    setLightningsState(lightnings);
    const userEmail = currentUserEmail;
    await fetch(`${API_BASE_URL}/user/currency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, lightnings }),
    });
  };

  return (
    <UserContext.Provider
      value={{
        completedLessons,
        lessonAttempts,
        coins,
        lightnings,
        firstName,
        lastName,
        currentUserEmail,
        setCompletedLessons,
        setLessonAttempts,
        markLessonCompleted,
        markLessonAttempted,
        setCoins,
        setLightnings,
        setCurrentUser,
        logout,
        refreshUserData: () => fetchUserData(),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
