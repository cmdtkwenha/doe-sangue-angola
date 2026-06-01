"use client";

import { useState } from "react";
import { useApiData } from "../../../hooks/useApiData";
import { EmptyState } from "../../ui/EmptyState";
import { LoadingSkeleton } from "../../ui/LoadingSkeleton";
import styles from "./pilotFeedbackPanel.module.css";

type Feedback = {
  contact?: string | null;
  created_at: string;
  description: string;
  id: string;
  issue_type: string;
  page: string;
  role: string;
  severity: string;
  status: string;
};

const severities = ["", "low", "medium", "high", "critical"];
const statuses = ["", "open", "in_progress", "resolved"];

export function PilotFeedbackPanel() {
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [version, setVersion] = useState(0);
  const params = new URLSearchParams({ severity, status });
  const { data, error, loading } = useApiData<Feedback[]>(`/api/pilot-feedback?${params.toString()}`, [], version);
  const [message, setMessage] = useState("");

  async function update(feedbackId: string, nextStatus: string) {
    const response = await fetch("/api/pilot-feedback", {
      body: JSON.stringify({ feedbackId, status: nextStatus }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    });
    const payload = await response.json().catch(() => ({ message: "Erro desconhecido." }));
    setMessage(payload.ok ? "Feedback atualizado." : payload.message);
    if (payload.ok) setVersion((value) => value + 1);
  }

  if (loading) return <LoadingSkeleton label="A carregar feedback do piloto" />;
  if (error) return <EmptyState title="Não foi possível carregar feedback" message={error} />;

  return (
    <section className={styles.panel}>
      <header>
        <span>
          <p className="eyebrow">Piloto</p>
          <h2>Feedback dos Testadores</h2>
        </span>
        <label>Gravidade<select value={severity} onChange={(event) => setSeverity(event.target.value)}>{severities.map((item) => <option key={item} value={item}>{item || "Todas"}</option>)}</select></label>
        <label>Estado<select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item} value={item}>{statusLabel(item) || "Todos"}</option>)}</select></label>
      </header>
      {data.length ? data.map((item) => (
        <article className={styles.item} key={item.id}>
          <div>
            <strong>{typeLabel(item.issue_type)} · {severityLabel(item.severity)}</strong>
            <p>{item.description}</p>
            <small>{item.role} · {item.page} · {date(item.created_at)} {item.contact ? `· ${item.contact}` : ""}</small>
          </div>
          <select value={item.status} onChange={(event) => void update(item.id, event.target.value)}>
            {statuses.filter(Boolean).map((entry) => <option key={entry} value={entry}>{statusLabel(entry)}</option>)}
          </select>
        </article>
      )) : <EmptyState title="Sem feedback" message="Os reportes dos testadores aparecerão aqui." />}
      {message ? <p className="muted" role="status">{message}</p> : null}
    </section>
  );
}

function typeLabel(value: string) {
  return ({
    bug: "Bug",
    login_problem: "Login",
    notification_problem: "Notificação",
    other: "Outro",
    pin_problem: "PIN",
    request_problem: "Pedido",
    ui_confusion: "Interface"
  } as Record<string, string>)[value] ?? value;
}

function severityLabel(value: string) {
  return ({ critical: "Crítica", high: "Alta", low: "Baixa", medium: "Média" } as Record<string, string>)[value] ?? value;
}

function statusLabel(value: string) {
  return ({ in_progress: "Em progresso", open: "Aberto", resolved: "Resolvido" } as Record<string, string>)[value] ?? value;
}

function date(value: string) {
  return new Date(value).toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" });
}
