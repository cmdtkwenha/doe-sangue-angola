import { getPilotAnalytics } from "@doe-sangue-angola/shared-services";
import styles from "./pilot.module.css";

export function PilotAnalyticsPanel() {
  const analytics = getPilotAnalytics();

  return (
    <section className={styles.panel}>
      <div className="eyebrow">Analytics piloto</div>
      <h2>Luanda e Benguela</h2>
      <div className={styles.metrics}>
        <Metric label="Hospitais" value={analytics.hospitals} />
        <Metric label="Dadores" value={analytics.donors} />
        <Metric label="Pedidos" value={analytics.activeRequests} />
      </div>
      <p className="muted">
        Notificações: {analytics.notificationsSafe ? "seguras em teste" : "requerem revisão"}.
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className={styles.metric}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
