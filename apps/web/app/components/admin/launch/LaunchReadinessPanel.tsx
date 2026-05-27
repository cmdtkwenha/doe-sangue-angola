"use client";

import { useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../../ui/EmptyState";
import styles from "../adminCore.module.css";

type Check = { detail: string; label: string; ok: boolean };
type Readiness = { checklist: Check[]; health: Check[] };
type ActionResult = { message?: string; ok?: boolean };

export function LaunchReadinessPanel() {
  const [version, setVersion] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState("");
  const { data, error, loading } = useApiData<Readiness>(
    "/api/admin/launch-readiness",
    { checklist: [], health: [] },
    version
  );

  async function run(action: "reset" | "seed") {
    setSaving(action);
    setMessage(action === "seed" ? "A criar cenário piloto..." : "A limpar cenário piloto...");
    const response = await fetch("/api/admin/launch-readiness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const payload = await response.json().catch(() => null) as ActionResult | null;
    setMessage(payload?.message ?? "Ação concluída.");
    setSaving("");
    setVersion((current) => current + 1);
  }

  return (
    <section className={styles.mainGrid}>
      <ReadinessCard checks={data.health} loading={loading} title="Saúde de Produção" />
      <ReadinessCard checks={data.checklist} loading={loading} title="Checklist de Lançamento" />
      <article className={styles.panel}>
        <div className={styles.panelHead}>
          <strong>Cenário de Teste</strong>
          <span className="pill gold">Admin</span>
        </div>
        <p className="muted">
          Cria ou remove apenas dados marcados como PILOT-TEST para validar pedidos, PIN e aceite.
        </p>
        <div className={styles.headerTools}>
          <button className="button" disabled={Boolean(saving)} onClick={() => void run("seed")} type="button">
            {saving === "seed" ? "A criar..." : "Criar teste"}
          </button>
          <button className="button secondary" disabled={Boolean(saving)} onClick={() => void run("reset")} type="button">
            {saving === "reset" ? "A limpar..." : "Repor teste"}
          </button>
        </div>
        {message ? <p className="muted" role="status">{message}</p> : null}
        {error ? <p className="muted">{error}</p> : null}
      </article>
    </section>
  );
}

function ReadinessCard({ checks, loading, title }: {
  checks: Check[];
  loading: boolean;
  title: string;
}) {
  return (
    <article className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>{title}</strong>
        <span className="pill">{loading ? "A verificar" : `${checks.filter((item) => item.ok).length}/${checks.length}`}</span>
      </div>
      {checks.length === 0 ? (
        <EmptyState title="Sem dados" message="Ainda não foi possível carregar a prontidão." />
      ) : (
        <div className={styles.requestList}>
          {checks.map((check) => (
            <div className={styles.requestRow} key={check.label}>
              <span className={check.ok ? "pill green" : "pill red"}>{check.ok ? "OK" : "Ação"}</span>
              <strong>{check.label}</strong>
              <span className="muted">{check.detail}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
