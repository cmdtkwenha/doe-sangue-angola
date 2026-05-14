import Link from "next/link";
import type { ReactNode } from "react";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import { getRedirectForRole } from "@doe-sangue-angola/shared-services";
import { OnboardingStepCard } from "./OnboardingStepCard";
import { onboardingSteps, roleLabels } from "./onboardingData";
import styles from "./onboarding.module.css";

export function OnboardingShell({
  children,
  role,
  subtitle,
  title
}: {
  children: ReactNode;
  role: UserRole;
  subtitle: string;
  title: string;
}) {
  const steps = onboardingSteps[role];

  return (
    <main className={styles.shell} id="conteudo-principal" tabIndex={-1}>
      <header className={styles.header}>
        <div>
          <div className="eyebrow">Onboarding • {roleLabels[role]}</div>
          <h1 className="title">{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>
        <span className={styles.mark}>DSA</span>
      </header>
      <div className={styles.layout}>
        <section className={`${styles.panel} ${styles.steps}`}>
          {steps.map((step, index) => (
            <OnboardingStepCard index={index} key={step.title} step={step} />
          ))}
          <div className={styles.actions}>
            <Link className="button" href={getRedirectForRole(role)}>
              Ir para o painel
            </Link>
            <Link className={styles.secondary} href="/auth">
              Voltar ao acesso
            </Link>
          </div>
        </section>
        {children}
      </div>
    </main>
  );
}
