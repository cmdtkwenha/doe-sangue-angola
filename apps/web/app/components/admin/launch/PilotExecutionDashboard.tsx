"use client";

import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../../ui/EmptyState";
import styles from "../../pilot/pilot.module.css";

type PilotExecution = {
  completedDonations: number;
  failedActions: number;
  openRequests: number;
  pilotDonors: number;
  pilotHospitals: number;
  systemHealth: string;
};

export function PilotExecutionDashboard() {
  const { data, error, loading } = useApiData<PilotExecution>(
    "/api/admin/pilot-execution",
    emptyPilotExecution
  );

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className="eyebrow">Execução do piloto</div>
          <h2>Painel final do dia de teste</h2>
        </div>
        <span className={data.systemHealth === "Operacional" ? "pill green" : "pill gold"}>
          {loading ? "A verificar" : data.systemHealth}
        </span>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      {!loading && error ? (
        <EmptyState title="Sem leitura operacional" message="Verifique sessão admin e Supabase." />
      ) : (
        <div className={styles.metrics}>
          <Metric label="Hospitais ativos" value={data.pilotHospitals} />
          <Metric label="Dadores ativos" value={data.pilotDonors} />
          <Metric label="Pedidos abertos" value={data.openRequests} />
          <Metric label="Doações concluídas" value={data.completedDonations} />
          <Metric label="Ações falhadas" value={data.failedActions} />
          <Metric label="Saúde" value={data.systemHealth} />
        </div>
      )}
    </section>
  );
}

const emptyPilotExecution: PilotExecution = {
  completedDonations: 0,
  failedActions: 0,
  openRequests: 0,
  pilotDonors: 0,
  pilotHospitals: 0,
  systemHealth: "A verificar"
};

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <article className={styles.metric}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
