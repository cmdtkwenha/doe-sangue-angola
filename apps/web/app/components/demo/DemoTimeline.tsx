"use client";

import { getInvestorDemoScenario } from "@doe-sangue-angola/shared-services";
import { DemoModeProvider, useDemoMode } from "./DemoModeProvider";
import { DemoLauncher } from "./DemoLauncher";
import { DemoStepCard } from "./DemoStepCard";
import { FakeRealtimeGenerator } from "./FakeRealtimeGenerator";
import styles from "./demo.module.css";

export function DemoTimeline() {
  return (
    <DemoModeProvider>
      <DemoTimelineInner />
    </DemoModeProvider>
  );
}

function DemoTimelineInner() {
  const scenario = getInvestorDemoScenario();
  const { activeStep, enabled } = useDemoMode();

  return (
    <section className={styles.panel}>
      <FakeRealtimeGenerator />
      <DemoLauncher />
      {enabled ? (
        <div className={styles.timeline}>
          {scenario.steps.map((step, index) => (
            <div className={index === activeStep + 2 ? styles.focus : ""} key={step.id}>
              <DemoStepCard step={step} />
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Demo pausado. Ative para apresentar o fluxo completo.</p>
      )}
    </section>
  );
}
