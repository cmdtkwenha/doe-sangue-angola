"use client";

import { runInvestorDemoStep } from "@doe-sangue-angola/shared-services";
import { useEffect } from "react";
import { useDemoMode } from "./DemoModeProvider";

export function FakeRealtimeGenerator() {
  const { activeStep, enabled } = useDemoMode();

  useEffect(() => {
    if (enabled) runInvestorDemoStep(activeStep);
  }, [activeStep, enabled]);

  return null;
}
