import {
  getMonitoringSummary,
  listPerformanceMetrics
} from "@doe-sangue-angola/shared-services";
import styles from "./monitoring.module.css";

export function AdminSystemHealthPanel() {
  const summary = getMonitoringSummary();
  const performance = listPerformanceMetrics()[0];

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Saúde do Sistema</strong>
        <span className="pill green">Mock ativo</span>
      </div>
      <div className={styles.metrics}>
        <Metric label="Eventos" value={summary.events} />
        <Metric label="Erros" value={summary.errors} />
        <Metric label="API média" value={`${summary.averageApiMs} ms`} />
        <Metric label="Última renderização" value={`${performance?.durationMs ?? 0} ms`} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <article className={styles.metric}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
