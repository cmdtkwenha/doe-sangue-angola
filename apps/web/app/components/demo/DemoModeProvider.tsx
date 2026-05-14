"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type DemoContextValue = {
  activeStep: number;
  enabled: boolean;
  goTo: (step: number) => void;
  next: () => void;
  reset: () => void;
  setEnabled: (enabled: boolean) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const value = useMemo(() => ({
    activeStep,
    enabled,
    goTo: (step: number) => setActiveStep(Math.max(0, Math.min(step, 12))),
    next: () => setActiveStep((step) => Math.min(step + 1, 12)),
    reset: () => setActiveStep(0),
    setEnabled
  }), [activeStep, enabled]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemoMode deve ser usado dentro de DemoModeProvider.");
  return context;
}
