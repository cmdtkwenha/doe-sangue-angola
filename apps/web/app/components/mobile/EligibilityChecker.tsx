import { eligibility, eligibilityQuestions } from "./mobileDonorAgents";
import { useState } from "react";
import styles from "./mobileGamification.module.css";
import { EligibilityQuestion } from "./EligibilityQuestion";
import { MobileShell } from "./MobileShell";

export function EligibilityChecker() {
  const [step, setStep] = useState(1);

  return (
    <MobileShell active="donations">
      <header>
        <strong>Verificação de Elegibilidade</strong>
        <p className="muted">Triagem rápida antes de aceitar uma doação.</p>
      </header>
      <section className={styles.panel}>
        <span className={eligibility.eligible ? "pill green" : "pill red"}>
          {eligibility.message}
        </span>
        {eligibilityQuestions.map(([key, prompt, answer, selected]) => (
          <EligibilityQuestion
            answer={answer}
            prompt={prompt}
            selected={selected}
            key={key}
          />
        ))}
        <button
          className="button"
          onClick={() => setStep(Math.min(step + 1, 5))}
          style={{ width: "100%", marginTop: 14 }}
          type="button"
        >
          {step >= 5 ? "Concluído" : `Próximo (${step}/5)`}
        </button>
      </section>
    </MobileShell>
  );
}
