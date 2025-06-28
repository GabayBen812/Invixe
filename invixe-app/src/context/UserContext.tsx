import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserContextType {
  completedLessons: number[];
  coins: number;
  lightnings: number;
  setCompletedLessons: (lessons: number[]) => void;
  setCoins: (coins: number) => void;
  setLightnings: (lightnings: number) => void;
  refreshUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [completedLessons, setCompletedLessonsState] = useState<number[]>([]);
  const [coins, setCoinsState] = useState<number>(0);
  const [lightnings, setLightningsState] = useState<number>(0);

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      const res = await fetch('http://10.0.0.22:4000/api/user/progress');
      if (!res.ok) {
        throw new Error(`Failed to fetch user data: ${res.status}`);
      }
      const data = await res.json();
      setCompletedLessonsState(data.completedLessons || []);
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

  // Update progress in backend
  const setCompletedLessons = async (lessons: number[]) => {
    try {
      setCompletedLessonsState(lessons);
      const res = await fetch('http://10.0.0.22:4000/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedLessons: lessons }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save progress: ${res.status}`);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error; // Re-throw so calling code can handle it
    }
  };

  // Update coins in backend
  const setCoins = async (coins: number) => {
    setCoinsState(coins);
    await fetch('http://10.0.0.22:4000/api/user/currency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coins }),
    });
  };

  // Update lightnings in backend
  const setLightnings = async (lightnings: number) => {
    setLightningsState(lightnings);
    await fetch('http://10.0.0.22:4000/api/user/currency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lightnings }),
    });
  };

  return (
    <UserContext.Provider value={{ completedLessons, coins, lightnings, setCompletedLessons, setCoins, setLightnings, refreshUserData: fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}; 