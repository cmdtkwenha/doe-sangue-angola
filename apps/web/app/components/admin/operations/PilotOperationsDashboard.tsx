"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useApiData } from "../../../hooks/useApiData";
import { useSupabaseRealtimeVersion } from "../../../hooks/useSupabaseRealtimeVersion";
import styles from "./operations.module.css";

type Metric = { label: string; value: string };
type MapItem = { id: string; municipality: string; name: string; province: string; type: string };
type OperationRow = Record<string, string | number>;
type Payload = {
  filters: { bloodTypes: string[]; municipalities: string[]; priorities: string[]; provinces: string[] };
  health: { criticalErrors: number; database: string; score: number; status: string; supabase: string };
  mapItems: MapItem[];
  metrics: Metric[];
  monitoring: Array<{ action: string; id: string; time: string }>;
  tables: {
    activeRequests: OperationRow[];
    incomingDonors: OperationRow[];
    topDonors: OperationRow[];
    topHospitals: OperationRow[];
  };
};

const empty: Payload = {
  filters: { bloodTypes: [], municipalities: [], priorities: [], provinces: [] },
  health: { criticalErrors: 0, database: "A verificar", score: 0, status: "A verificar", supabase: "A verificar" },
  mapItems: [],
  metrics: [],
  monitoring: [],
  tables: { activeRequests: [], incomingDonors: [], topDonors: [], topHospitals: [] }
};

export function PilotOperationsDashboard() {
  const [filters, setFilters] = useState({ bloodType: "", municipality: "", priority: "", province: "" });
  const version = useSupabaseRealtimeVersion(["audit_logs", "blood_requests", "donor_responses", "donors", "hospitals"]);
  const { data, error, loading } = useApiData<Payload>("/api/admin/operations", empty, version);
  const filteredMap = useMemo(() => data.mapItems.filter((item) =>
    (!filters.province || item.province === filters.province) &&
    (!filters.municipality || item.municipality === filters.municipality)
  ), [data.mapItems, filters.municipality, filters.province]);
  const activeRequests = useMemo(() => data.tables.activeRequests.filter((row) =>
    (!filters.bloodType || row.bloodType === filters.bloodType) &&
    (!filters.priority || row.urgency === filters.priority)
  ), [data.tables.activeRequests, filters.bloodType, filters.priority]);

  return (
    <section className={styles.filters}>
      <Select label="Província" value={filters.province} values={data.filters.provinces} onChange={(province) => setFilters((current) => ({ ...current, province }))} />
      <Select label="Município" value={filters.municipality} values={data.filters.municipalities} onChange={(municipality) => setFilters((current) => ({ ...current, municipality }))} />
      <Select label="Tipo Sanguíneo" value={filters.bloodType} values={data.filters.bloodTypes} onChange={(bloodType) => setFilters((current) => ({ ...current, bloodType }))} />
      <Select label="Prioridade" value={filters.priority} values={data.filters.priorities} onChange={(priority) => setFilters((current) => ({ ...current, priority }))} />

      <div style={{ gridColumn: "1 / -1" }}>
        {loading ? <p className="muted">A sincronizar operações em tempo real...</p> : null}
        {error ? <p className="muted">Falha operacional: {error}</p> : null}
      </div>

      <div className={styles.grid} style={{ gridColumn: "1 / -1" }}>
        {data.metrics.map((metric) => (
          <article className={styles.card} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <Panel title="Mapa Operacional" extra={`${filteredMap.length} pontos`}>
        {filteredMap.length === 0 ? <p className={styles.muted}>Sem pontos para os filtros selecionados.</p> : null}
        <div className={styles.mapGrid}>
          {filteredMap.slice(0, 16).map((item) => (
            <article className={styles.mapItem} key={`${item.type}-${item.id}`}>
              <strong>{item.name}</strong>
              <span className={styles.muted}>{item.municipality}, {item.province}</span>
              <span className={styles.tag}>{item.type}</span>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Monitorização em Tempo Real" extra="Eventos recentes">
        {data.monitoring.length === 0 ? <p className={styles.muted}>Sem eventos operacionais recentes.</p> : null}
        {data.monitoring.map((item) => (
          <div className={styles.event} key={item.id}>
            <strong>{item.action}</strong>
            <p className={styles.muted}>{item.time}</p>
          </div>
        ))}
      </Panel>

      <Panel title="Pilot Health Score" extra={`${data.health.score}%`}>
        <div className={styles.health}>
          <span className={styles.healthItem}>{data.health.status}</span>
          <span className={styles.healthItem}>{data.health.database}</span>
          <span className={styles.healthItem}>{data.health.supabase}</span>
          <span className={styles.healthItem}>{data.health.criticalErrors ? `${data.health.criticalErrors} erros críticos` : "Sem erros críticos"}</span>
        </div>
      </Panel>

      <Panel title="Pedidos Ativos" extra={<Exports name="pedidos-ativos" rows={activeRequests} />}>
        <DataTable columns={["hospital", "bloodType", "needed", "accepted", "remaining", "status"]} labels={["Hospital", "Tipo Sanguíneo", "Necessárias", "Aceites", "Restantes", "Estado"]} rows={activeRequests} />
      </Panel>

      <Panel title="Dadores a Caminho" extra={<Exports name="dadores-a-caminho" rows={data.tables.incomingDonors} />}>
        <DataTable columns={["donor", "hospital", "eta", "status"]} labels={["Nome", "Hospital", "ETA", "Estado"]} rows={data.tables.incomingDonors} />
      </Panel>

      <div className={styles.tables} style={{ gridColumn: "1 / -1" }}>
        <Panel title="Hospitais com Mais Atividade">
          <DataTable columns={["name", "count"]} labels={["Hospital", "Pedidos"]} rows={data.tables.topHospitals} />
        </Panel>
        <Panel title="Dadores Mais Ativos">
          <DataTable columns={["name", "count"]} labels={["Dador", "Doações"]} rows={data.tables.topDonors} />
        </Panel>
      </div>
    </section>
  );
}

function Select({ label, onChange, value, values }: { label: string; onChange: (value: string) => void; value: string; values: string[] }) {
  return (
    <label>
      <span className={styles.muted}>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">Todos</option>
        {values.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );
}

function Panel({ children, extra, title }: { children: ReactNode; extra?: ReactNode; title: string }) {
  return (
    <section className={styles.panel} style={{ gridColumn: "1 / -1" }}>
      <div className={styles.head}>
        <strong>{title}</strong>
        {extra ? <span className={styles.muted}>{extra}</span> : null}
      </div>
      {children}
    </section>
  );
}

function DataTable({ columns, labels, rows }: { columns: string[]; labels: string[]; rows: OperationRow[] }) {
  if (!rows.length) return <p className={styles.muted}>Sem dados operacionais para mostrar.</p>;
  return (
    <table className={styles.table}>
      <thead><tr>{labels.map((label) => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={String(row.id ?? index)}>
            {columns.map((column) => <td key={column}>{String(row[column] ?? "")}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Exports({ name, rows }: { name: string; rows: OperationRow[] }) {
  return (
    <span className={styles.export}>
      <button onClick={() => window.print()} type="button">Export PDF</button>
      <button onClick={() => downloadCsv(name, rows)} type="button">Export Excel</button>
    </span>
  );
}

function downloadCsv(name: string, rows: OperationRow[]) {
  const headers = Object.keys(rows[0] ?? { Estado: "" });
  const lines = [headers.join(","), ...rows.map((row) => headers.map((key) => `"${String(row[key] ?? "").replaceAll("\"", "\"\"")}"`).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
