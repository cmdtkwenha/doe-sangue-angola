"use client";

import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../../ui/EmptyState";
import styles from "../adminCore.module.css";

type Check = { detail: string; label: string; ok: boolean };
type Readiness = { checks: Check[] };

export function DeploymentReadinessPanel() {
  const { data, error, loading } = useApiData<Readiness>(
    "/api/admin/deployment-readiness",
    { checks: [] }
  );

  return (
    <article className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Checklist Automática de Deploy</strong>
        <span className="pill">{loading ? "A verificar" : `${ready(data.checks)}/${data.checks.length}`}</span>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      {data.checks.length === 0 ? (
        <EmptyState title="Sem verificações" message="A checklist aparece quando a API responder." />
      ) : (
        <div className={styles.requestList}>
          {data.checks.map((check) => (
            <div className={styles.requestRow} key={check.label}>
              <span className={check.ok ? "pill green" : "pill gold"}>
                {check.ok ? "OK" : "Ação"}
              </span>
              <strong>{check.label}</strong>
              <span className="muted">{check.detail}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function ready(checks: Check[]) {
  return checks.filter((check) => check.ok).length;
}
