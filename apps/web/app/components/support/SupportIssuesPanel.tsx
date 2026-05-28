"use client";

import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../ui/EmptyState";
import styles from "./support.module.css";

type Issue = {
  action: string;
  created_at: string;
  id: string;
  message: string;
  page: string;
  role: string;
  severity?: string;
  status: string;
  type: string;
};

export function SupportIssuesPanel() {
  const { data, error, loading } = useApiData<Issue[]>("/api/support/issues", []);

  return (
    <section className={styles.panel}>
      <div>
        <div className="eyebrow">Suporte operacional</div>
        <h2>Problemas reportados</h2>
      </div>
      {loading ? <p className="muted">A carregar problemas...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {!loading && !data.length ? (
        <EmptyState title="Sem problemas reportados" message="Os reportes do piloto aparecem aqui." />
      ) : (
        <div className={styles.items}>
          {data.slice(0, 6).map((issue) => (
            <article className={styles.item} key={issue.id}>
              <strong>{issue.type} · {issue.role}</strong>
              <span className="muted">{issue.page} · {issue.action}</span>
              <span className={issue.severity === "Crítica" ? "pill red" : "pill gold"}>
                {issue.severity ?? "Média"}
              </span>
              <span>{issue.message}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
