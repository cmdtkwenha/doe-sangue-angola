import type { OnboardingStep } from "./onboardingData";
import styles from "./onboarding.module.css";

const statusClass: Record<OnboardingStep["status"], string> = {
  "A fazer": styles.statusDoing,
  Pendente: "",
  Pronto: styles.statusReady
};

export function OnboardingStepCard({
  index,
  step
}: {
  index: number;
  step: OnboardingStep;
}) {
  return (
    <article className={styles.step}>
      <span className={styles.number}>{index + 1}</span>
      <div>
        <div className="eyebrow">{step.eyebrow}</div>
        <h3>{step.title}</h3>
        <p className="muted">{step.body}</p>
      </div>
      <span className={`${styles.status} ${statusClass[step.status]}`}>
        {step.status}
      </span>
    </article>
  );
}
