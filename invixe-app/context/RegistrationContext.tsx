import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RegistrationData {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  ageGroup: string;
  goal: string;
}

interface RegistrationContextType {
  data: RegistrationData;
  setPhone: (phone: string) => void;
  setPassword: (password: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setAgeGroup: (ageGroup: string) => void;
  setGoal: (goal: string) => void;
  reset: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(
  undefined,
);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegistrationData>({
    phone: "",
    password: "",
    firstName: "",
    lastName: "",
    ageGroup: "",
    goal: "",
  });

  const setPhone = (phone: string) => setData((d) => ({ ...d, phone }));
  const setPassword = (password: string) =>
    setData((d) => ({ ...d, password }));
  const setFirstName = (firstName: string) =>
    setData((d) => ({ ...d, firstName }));
  const setLastName = (lastName: string) =>
    setData((d) => ({ ...d, lastName }));
  const setAgeGroup = (ageGroup: string) =>
    setData((d) => ({ ...d, ageGroup }));
  const setGoal = (goal: string) => setData((d) => ({ ...d, goal }));
  const reset = () =>
    setData({
      phone: "",
      password: "",
      firstName: "",
      lastName: "",
      ageGroup: "",
      goal: "",
    });

  return (
    <RegistrationContext.Provider
      value={{
        data,
        setPhone,
        setPassword,
        setFirstName,
        setLastName,
        setAgeGroup,
        setGoal,
        reset,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx)
    throw new Error("useRegistration must be used within RegistrationProvider");
  return ctx;
}