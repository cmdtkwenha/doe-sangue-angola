import styles from "./monitoring.module.css";

const items = [
  ["Realtime", "Reconexão automática dos canais Supabase ao desmontar/remontar."],
  ["Supabase", "Mutations críticas usam mensagens de erro claras e podem receber retry."],
  ["Offline", "Estados de carregamento mantêm a interface utilizável durante falhas de rede."]
];

export function ResiliencePanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Retry e Resiliência</strong>
        <span className="pill green">Preparado</span>
      </div>
      {items.map(([title, body]) => (
        <article className={styles.recoveryRow} key={title}>
          <span>✓</span>
          <strong>{title}</strong>
          <small className="muted">{body}</small>
        </article>
      ))}
    </section>
  );
}
