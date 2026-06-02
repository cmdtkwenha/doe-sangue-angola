"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../ui/EmptyState";
import styles from "./adminAdvanced.module.css";

export function PerformanceChart() {
  const { data: requests, loading } = useApiData<BloodRequest[]>("/api/blood-requests", []);
  const completed = requests.filter((request) => request.status === "Concluído");
  const active = requests.filter((request) => !["Cancelado", "Concluído"].includes(request.status));
  const fulfilment = requests.length ? Math.round((completed.length / requests.length) * 100) : 0;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Análise de Desempenho</strong>
        <span className="muted">Dados Supabase</span>
      </div>
      {loading ? <p className="muted">A calcular desempenho real...</p> : null}
      {!loading && requests.length === 0 ? (
        <EmptyState title="Sem desempenho real" message="O painel aparece após pedidos piloto." />
      ) : (
        <div className={styles.advancedGrid}>
          <Metric label="Taxa de cumprimento" value={`${fulfilment}%`} />
          <Metric label="Pedidos ativos" value={String(active.length)} />
          <Metric label="Doações concluídas" value={String(completed.length)} />
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="muted">{label}</span>
      <h3 style={{ margin: "6px 0" }}>{value}</h3>
      <span className="pill">Real</span>
    </div>
  );
}
