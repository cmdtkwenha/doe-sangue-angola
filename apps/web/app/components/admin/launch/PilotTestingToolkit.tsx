"use client";

import { useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../../ui/EmptyState";
import { ExportButton } from "../management/ExportButton";
import styles from "./pilotToolkit.module.css";

type Row = Record<string, string | number | boolean | null>;
type Health = { detail: string; label: string; status: "Operacional" | "Aviso" | "Crítico" };
type Issue = { count: number; label: string; samples: string[] };
type Checklist = { label: string; ok: boolean };
type Toolkit = {
  checklist: Checklist[];
  exports: { donors: Row[]; hospitals: Row[]; requests: Row[]; responses: Row[] };
  health: Health[];
  issues: Issue[];
  monitoring: Record<string, Row[]>;
  status: "Operacional" | "Aviso" | "Crítico";
  workflow: Record<string, number>;
};

const empty: Toolkit = {
  checklist: [],
  exports: { donors: [], hospitals: [], requests: [], responses: [] },
  health: [],
  issues: [],
  monitoring: {},
  status: "Aviso",
  workflow: {}
};

const actions = [
  ["requests", "Limpar pedidos de sangue"],
  ["responses", "Limpar aceites"],
  ["pins", "Limpar PINs"],
  ["notifications", "Limpar notificações"]
] as const;

export function PilotTestingToolkit() {
  const [version, setVersion] = useState(0);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const { data, error, loading } = useApiData<Toolkit>("/api/admin/pilot-toolkit", empty, version);

  async function run(action: string) {
    if (!window.confirm("Confirma a limpeza destes dados de piloto?")) return;
    setSaving(action);
    setMessage("A executar limpeza piloto...");
    const response = await fetch("/api/admin/pilot-toolkit", {
      body: JSON.stringify({ action }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json().catch(() => null);
    setMessage(payload?.data?.message ?? payload?.message ?? "Ação concluída.");
    setSaving("");
    setVersion((current) => current + 1);
  }

  return (
    <section className={styles.shell}>
      <div className={styles.header}>
        <div>
          <div className="eyebrow">Toolkit piloto</div>
          <h2>Prontidão para teste real</h2>
        </div>
        <span className={statusClass(data.status)}>{loading ? "A verificar" : data.status}</span>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      <section className={styles.grid}>
        <ResetCard message={message} onRun={run} saving={saving} />
        <HealthCard checks={data.health} />
      </section>
      <section className={styles.grid}>
        <WorkflowCard workflow={data.workflow} />
        <ChecklistCard items={data.checklist} />
      </section>
      <section className={styles.grid}>
        <IntegrityCard issues={data.issues} />
        <MonitoringCard monitoring={data.monitoring} />
      </section>
      <ExportCard data={data.exports} />
    </section>
  );
}

function ResetCard({ message, onRun, saving }: {
  message: string;
  onRun: (action: string) => void;
  saving: string;
}) {
  return (
    <article className={styles.panel}>
      <strong>Utilitário de Limpeza Piloto</strong>
      <p className="muted">Mantém hospitais, dadores e administração. Limpa apenas dados operacionais.</p>
      <div className={styles.actions}>
        {actions.map(([action, label]) => (
          <button disabled={Boolean(saving)} key={action} onClick={() => onRun(action)} type="button">
            {saving === action ? "A limpar..." : label}
          </button>
        ))}
      </div>
      {message ? <p className="muted" role="status">{message}</p> : null}
      <div className={styles.keepList}>
        <span>Manter hospitais</span><span>Manter dadores</span><span>Manter administração</span>
      </div>
    </article>
  );
}

function HealthCard({ checks }: { checks: Health[] }) {
  return (
    <article className={styles.panel}>
      <strong>Saúde do Sistema</strong>
      <div className={styles.list}>
        {checks.map((item) => (
          <div className={styles.row} key={item.label}>
            <span>{item.label}</span>
            <small>{item.detail}</small>
            <span className={statusClass(item.status)}>{item.status}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function WorkflowCard({ workflow }: { workflow: Record<string, number> }) {
  const rows: Array<[string, number]> = [
    ["Hospitais verificados", workflow.verifiedHospitals ?? 0],
    ["Dadores verificados", workflow.verifiedDonors ?? 0],
    ["Pedidos ativos", workflow.activeRequests ?? 0],
    ["Dadores a caminho", workflow.incomingDonors ?? 0],
    ["PINs ativos", workflow.activePins ?? 0]
  ];
  return <MetricPanel rows={rows} title="Workflow" />;
}

function ChecklistCard({ items }: { items: Checklist[] }) {
  return (
    <article className={styles.panel}>
      <strong>Checklist do Piloto</strong>
      <div className={styles.checks}>
        {items.map((item) => <span key={item.label}>{item.ok ? "☑" : "☐"} {item.label}</span>)}
      </div>
    </article>
  );
}

function IntegrityCard({ issues }: { issues: Issue[] }) {
  return (
    <article className={styles.panel}>
      <strong>Verificador de Dados</strong>
      {issues.every((item) => item.count === 0) ? (
        <EmptyState title="Dados consistentes" message="Não foram encontrados bloqueios de teste." />
      ) : (
        <div className={styles.list}>
          {issues.map((item) => (
            <div className={styles.row} key={item.label}>
              <span>{item.label}</span><strong>{item.count}</strong>
              <small>{item.samples.join(", ") || "Sem amostras"}</small>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function MonitoringCard({ monitoring }: { monitoring: Record<string, Row[]> }) {
  const rows = [
    ["Últimos erros", monitoring.lastErrors ?? []],
    ["Falhas de login", monitoring.loginFailures ?? []],
    ["Falhas de aprovação", monitoring.approvalFailures ?? []],
    ["Falhas de PIN", monitoring.pinFailures ?? []]
  ] as const;
  return (
    <article className={styles.panel}>
      <strong>Monitorização de Erros</strong>
      <div className={styles.list}>
        {rows.map(([label, items]) => (
          <div className={styles.row} key={label}>
            <span>{label}</span><strong>{items.length}</strong>
            <small>{items[0]?.action ? String(items[0].action) : "Sem ocorrências recentes"}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function ExportCard({ data }: { data: Toolkit["exports"] }) {
  return (
    <article className={styles.panel}>
      <strong>Exportar Resultados Piloto</strong>
      <div className={styles.actions}>
        <ExportButton filename="piloto-pedidos.csv" rows={toStringRows(data.requests)} />
        <ExportButton filename="piloto-doacoes.csv" rows={toStringRows(data.responses)} />
        <ExportButton filename="piloto-dadores.csv" rows={toStringRows(data.donors)} />
        <ExportButton filename="piloto-hospitais.csv" rows={toStringRows(data.hospitals)} />
      </div>
    </article>
  );
}

function MetricPanel({ rows, title }: { rows: Array<[string, number]>; title: string }) {
  return (
    <article className={styles.panel}>
      <strong>{title}</strong>
      <div className={styles.metrics}>
        {rows.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}
      </div>
    </article>
  );
}

function statusClass(status: string) {
  if (status === "Operacional") return "pill green";
  if (status === "Crítico") return "pill red";
  return "pill gold";
}

function toStringRows(rows: Row[]) {
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "")])));
}
