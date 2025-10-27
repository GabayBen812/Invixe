import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getParentLessonForSublesson, areAllSublessonsCompleted } from '../modules/lessons/registry';

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
  currentUserEmail: string | null;
  setCompletedLessons: (lessons: number[]) => void;
  setLessonAttempts: (attempts: LessonAttempt[]) => void;
  markLessonCompleted: (lessonId: number) => void;
  markLessonAttempted: (lessonId: number) => void;
  setCoins: (coins: number) => void;
  setLightnings: (lightnings: number) => void;
  setCurrentUser: (email: string) => void;
  refreshUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [completedLessons, setCompletedLessonsState] = useState<number[]>([]);
  const [lessonAttempts, setLessonAttemptsState] = useState<LessonAttempt[]>([]);
  const [coins, setCoinsState] = useState<number>(0);
  const [lightnings, setLightningsState] = useState<number>(0);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Fetch user data from backend
  const fetchUserData = async (email?: string) => {
    try {
      const userEmail = email || currentUserEmail;
      if (!userEmail) {
        console.log('No user email provided, using default user');
        // For now, use a default user if no email is provided
        const res = await fetch('http://10.0.0.8:4000/api/user/progress');
        if (!res.ok) {
          throw new Error(`Failed to fetch user data: ${res.status}`);
        }
        const data = await res.json();
        setCompletedLessonsState(data.completedLessons || []);
        setLessonAttemptsState(data.lessonAttempts || []);
        setCoinsState(data.coins || 0);
        setLightningsState(data.lightnings || 0);
        return;
      }

      const res = await fetch(`http://10.0.0.8:4000/api/user/progress?email=${encodeURIComponent(userEmail)}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch user data: ${res.status}`);
      }
      const data = await res.json();
      setCompletedLessonsState(data.completedLessons || []);
      setLessonAttemptsState(data.lessonAttempts || []);
      setCoinsState(data.coins || 0);
      setLightningsState(data.lightnings || 0);
    } catch (e) {
      console.error('Error fetching user data:', e);
      // Keep default values if fetch fails
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Set current user and fetch their data
  const setCurrentUser = async (email: string) => {
    setCurrentUserEmail(email);
    await fetchUserData(email);
  };

  // Update progress in backend
  const setCompletedLessons = async (lessons: number[]) => {
    try {
      setCompletedLessonsState(lessons);
      const userEmail = currentUserEmail;
      const res = await fetch('http://10.0.0.8:4000/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail,
          completedLessons: lessons 
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save progress: ${res.status}`);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  // Update lesson attempts in backend
  const setLessonAttempts = async (attempts: LessonAttempt[]) => {
    try {
      setLessonAttemptsState(attempts);
      const userEmail = currentUserEmail;
      const res = await fetch('http://10.0.0.8:4000/api/user/lesson-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail,
          lessonAttempts: attempts 
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save lesson attempts: ${res.status}`);
      }
    } catch (error) {
      console.error('Error saving lesson attempts:', error);
      throw error;
    }
  };

  // Mark a lesson as completed
  const markLessonCompleted = async (lessonId: number) => {
    const existingAttempt = lessonAttempts.find(a => a.lessonId === lessonId);
    const updatedAttempts = [...lessonAttempts];
    
    if (existingAttempt) {
      const index = updatedAttempts.findIndex(a => a.lessonId === lessonId);
      updatedAttempts[index] = {
        ...existingAttempt,
        completed: true,
        lastAttempted: new Date(),
        attempts: existingAttempt.attempts + 1
      };
    } else {
      updatedAttempts.push({
        lessonId,
        completed: true,
        lastAttempted: new Date(),
        attempts: 1
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
    const existingAttempt = lessonAttempts.find(a => a.lessonId === lessonId);
    const updatedAttempts = [...lessonAttempts];
    
    if (existingAttempt) {
      const index = updatedAttempts.findIndex(a => a.lessonId === lessonId);
      updatedAttempts[index] = {
        ...existingAttempt,
        lastAttempted: new Date(),
        attempts: existingAttempt.attempts + 1
      };
    } else {
      updatedAttempts.push({
        lessonId,
        completed: false,
        lastAttempted: new Date(),
        attempts: 1
      });
    }

    await setLessonAttempts(updatedAttempts);
  };

  // Update coins in backend
  const setCoins = async (coins: number) => {
    setCoinsState(coins);
    const userEmail = currentUserEmail;
    await fetch('http://10.0.0.8:4000/api/user/currency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, coins }),
    });
  };

  // Update lightnings in backend
  const setLightnings = async (lightnings: number) => {
    setLightningsState(lightnings);
    const userEmail = currentUserEmail;
    await fetch('http://10.0.0.8:4000/api/user/currency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, lightnings }),
    });
  };

  return (
    <UserContext.Provider value={{ 
      completedLessons, 
      lessonAttempts,
      coins, 
      lightnings, 
      currentUserEmail,
      setCompletedLessons, 
      setLessonAttempts,
      markLessonCompleted,
      markLessonAttempted,
      setCoins, 
      setLightnings, 
      setCurrentUser,
      refreshUserData: () => fetchUserData() 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}; 