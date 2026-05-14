"use client";

import { getInvestorDemoScenario } from "@doe-sangue-angola/shared-services";
import { useDemoMode } from "./DemoModeProvider";
import styles from "./demo.module.css";

export function GuidedTour() {
  const { activeStep, goTo } = useDemoMode();
  const steps = getInvestorDemoScenario().steps;

  return (
    <section className={styles.tour}>
      <div>
        <div className="eyebrow">Roteiro do fundador</div>
        <h3>{steps[activeStep]?.title}</h3>
        <p>{steps[activeStep]?.detail}</p>
      </div>
      <div className={styles.tourDots}>
        {steps.map((step, index) => (
          <button
            aria-label={`Abrir passo ${step.id}`}
            className={`${styles.tourDot} ${index === activeStep ? styles.tourDotActive : ""}`}
            key={step.id}
            onClick={() => goTo(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
