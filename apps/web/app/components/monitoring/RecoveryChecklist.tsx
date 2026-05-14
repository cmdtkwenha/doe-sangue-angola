import styles from "./monitoring.module.css";

const recoverySteps = [
  "Confirmar ambiente afetado",
  "Pausar ações arriscadas",
  "Encontrar último backup válido",
  "Restaurar primeiro em staging",
  "Testar fluxos críticos",
  "Aprovar restore em produção"
] as const;

export function RecoveryChecklist() {
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Checklist de Recuperação</strong>
        <span className="pill">DR pronto</span>
      </div>
      {recoverySteps.map((step, index) => (
        <article className={styles.recoveryRow} key={step}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
          <small className="muted">Fluxo documentado, integração real futura.</small>
        </article>
      ))}
    </section>
  );
}
