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
      const res = await fetch('http://localhost:4000/api/user/progress');
      const data = await res.json();
      setCompletedLessonsState(data.completedLessons || []);
      setCoinsState(data.coins || 0);
      setLightningsState(data.lightnings || 0);
    } catch (e) {
      // handle error
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Update progress in backend
  const setCompletedLessons = async (lessons: number[]) => {
    setCompletedLessonsState(lessons);
    await fetch('http://localhost:4000/api/user/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedLessons: lessons }),
    });
  };

  // Update coins in backend
  const setCoins = async (coins: number) => {
    setCoinsState(coins);
    await fetch('http://localhost:4000/api/user/currency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coins }),
    });
  };

  // Update lightnings in backend
  const setLightnings = async (lightnings: number) => {
    setLightningsState(lightnings);
    await fetch('http://localhost:4000/api/user/currency', {
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