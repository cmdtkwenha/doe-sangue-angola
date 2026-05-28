import {
  getProductionMonitoring,
  getSystemStatusCopy
} from "@doe-sangue-angola/shared-services";
import { FeatureFlagsPanel, OperationalAlertsPanel } from "../components/monitoring";
import styles from "./status.module.css";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const monitoring = await getProductionMonitoring();
  const status = getSystemStatusCopy(monitoring.status);

  return (
    <main className={styles.shell}>
      <section className={styles.content}>
        <header className={styles.hero}>
          <p className="eyebrow">Estado do sistema</p>
          <h1>Doe Sangue Angola está {status}</h1>
          <p className="muted">
            Página pública para acompanhar disponibilidade, degradações e manutenção planeada.
          </p>
        </header>
        <section className={styles.metrics}>
          <Metric label="Auth" value={monitoring.authHealth} />
          <Metric label="Supabase" value={`${monitoring.supabaseLatencyMs} ms`} />
          <Metric label="Realtime" value={monitoring.realtimeStatus} />
        </section>
        <OperationalAlertsPanel />
        <FeatureFlagsPanel />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.metric}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
