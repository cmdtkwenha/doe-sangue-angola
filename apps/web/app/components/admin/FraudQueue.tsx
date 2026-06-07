"use client";

import { useApiData } from "../../hooks/useApiData";
import { useSupabaseRealtimeVersion } from "../../hooks/useSupabaseRealtimeVersion";
import styles from "./adminAdvanced.module.css";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

type FraudItem = {
  entity: string;
  flags: string[];
  id: string;
  score: number;
  status: string;
};

export function FraudQueue() {
  const version = useSupabaseRealtimeVersion(["donors", "donor_responses", "fraud_reviews", "hospitals"]);
  const { data: items, error, loading } = useApiData<FraudItem[]>("/api/admin/fraud", [], version);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Fila de Revisão de Fraude</strong>
        <span className="pill red">{items.length} casos</span>
      </div>
      {loading ? <p className="muted">A carregar sinais de risco...</p> : null}
      {error ? <p className="muted">Falha ao carregar fraude: {error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="muted">Sem sinais de fraude em aberto.</p>
      ) : null}
      {items.slice(0, 5).map((item) => (
        <article className={styles.row} key={item.id}>
          <div className={styles.rowTop}>
            <strong>{item.id}</strong>
            <VerificationStatusBadge status={item.status} />
          </div>
          <span className="muted">{item.entity}</span>
          <div className={styles.riskLine}>
            <span style={{ width: `${item.score}%` }} />
          </div>
          <small className="muted">{item.flags.join(" · ")}</small>
        </article>
      ))}
    </section>
  );
}
