import { getProductionMonitoring } from "@doe-sangue-angola/shared-services";
import styles from "./monitoring.module.css";

export async function ProductionMonitoringPanel() {
  const health = await getProductionMonitoring();

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Operações de Produção</strong>
        <span className={health.status === "operational" ? "pill green" : "pill gold"}>
          {health.status}
        </span>
      </div>
      <div className={styles.metrics}>
        <Metric label="Auth" value={health.authHealth} />
        <Metric label="Supabase" value={`${health.supabaseLatencyMs} ms`} />
        <Metric label="Realtime" value={health.realtimeStatus} />
        <Metric label="Notificações" value={health.notificationDelivery} />
        <Metric label="Falhas ações" value={health.failedActions} />
        <Metric label="Erros frontend" value={health.frontendErrors} />
        <Metric label="Falhas pedidos" value={health.requestCreationFailures} />
        <Metric label="Falhas aceite" value={health.donorAcceptanceFailures} />
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
