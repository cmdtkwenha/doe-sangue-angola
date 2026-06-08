"use client";

import { useApiData } from "../../../hooks/useApiData";
import { ManagementTable } from "./ManagementTable";
import styles from "./management.module.css";

type HealthPayload = {
  checks: { detail: string; label: string; state: string }[];
  errors: { action: string; actor: string; id: string; time: string }[];
  metrics: {
    failedApprovals: number;
    failedPins: number;
    failedRequests: number;
    latestErrors: number;
    responseMs: number;
  };
};

const emptyHealth: HealthPayload = {
  checks: [],
  errors: [],
  metrics: { failedApprovals: 0, failedPins: 0, failedRequests: 0, latestErrors: 0, responseMs: 0 }
};

export function SystemHealthPanel() {
  const { data, error, loading } = useApiData<HealthPayload>("/api/admin/system-health", emptyHealth);

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <strong>Saúde operacional</strong>
          <span className="muted">{loading ? "A verificar..." : "Dados em tempo real"}</span>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.detailGrid} style={{ padding: 14 }}>
          {data.checks.map((item) => (
            <span key={item.label}>
              <small>{item.label}</small>
              <strong>{item.state}</strong>
              <em className="muted">{item.detail}</em>
            </span>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <strong>Painel de erros</strong>
          <span className="muted">Falhas críticas recentes</span>
        </div>
        <div className={styles.detailGrid} style={{ padding: 14 }}>
          <Metric label="Falhas em pedidos" value={data.metrics.failedRequests} />
          <Metric label="Falhas em aprovações" value={data.metrics.failedApprovals} />
          <Metric label="Falhas de PIN" value={data.metrics.failedPins} />
          <Metric label="Últimos erros" value={data.metrics.latestErrors} />
        </div>
      </section>

      <ManagementTable
        disableFilters
        title="Últimos erros"
        exportName="erros-operacionais.csv"
        columns={["Hora", "Utilizador", "Evento"]}
        rows={data.errors.map((item) => ({
          actions: ["Ver auditoria"],
          id: item.id,
          status: "Aviso",
          values: {
            Evento: item.action,
            Hora: item.time,
            Utilizador: item.actor
          }
        }))}
      />
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <span>
      <small>{label}</small>
      <strong>{value}</strong>
      <em className="muted">Registos de auditoria</em>
    </span>
  );
}
