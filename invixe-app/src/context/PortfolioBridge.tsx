import React, { ReactNode } from "react";
import { PortfolioProvider } from "./PortfolioContext";
import { useUser } from "./UserContext";

/** Binds portfolio data to the active user session (must render inside UserProvider). */
export function PortfolioBridge({ children }: { children: ReactNode }) {
  const { currentUserEmail, lessonAttempts } = useUser();
  return (
    <PortfolioProvider
      currentUserEmail={currentUserEmail}
      lessonAttempts={lessonAttempts}
    >
      {children}
    </PortfolioProvider>
  );
}
