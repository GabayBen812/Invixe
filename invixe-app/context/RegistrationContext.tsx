import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RegistrationData {
  phone: string;
  password: string;
  ageGroup: string;
  goal: string;
}

interface RegistrationContextType {
  data: RegistrationData;
  setPhone: (phone: string) => void;
  setPassword: (password: string) => void;
  setAgeGroup: (ageGroup: string) => void;
  setGoal: (goal: string) => void;
  reset: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegistrationData>({
    phone: '',
    password: '',
    ageGroup: '',
    goal: '',
  });

  const setPhone = (phone: string) => setData(d => ({ ...d, phone }));
  const setPassword = (password: string) => setData(d => ({ ...d, password }));
  const setAgeGroup = (ageGroup: string) => setData(d => ({ ...d, ageGroup }));
  const setGoal = (goal: string) => setData(d => ({ ...d, goal }));
  const reset = () => setData({ phone: '', password: '', ageGroup: '', goal: '' });

  return (
    <RegistrationContext.Provider value={{ data, setPhone, setPassword, setAgeGroup, setGoal, reset }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error('useRegistration must be used within RegistrationProvider');
  return ctx;
} 