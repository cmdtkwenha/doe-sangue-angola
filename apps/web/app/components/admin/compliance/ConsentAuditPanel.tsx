"use client";

import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../../ui/EmptyState";
import styles from "../adminCore.module.css";

type Consent = {
  accepted_at: string;
  consent_type: string;
  id: string;
  page: string;
  role: string;
  version: string;
};

export function ConsentAuditPanel() {
  const { data, error, loading } = useApiData<Consent[]>("/api/legal/consents", []);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Consentimentos Legais</strong>
        <span className="pill">{loading ? "A carregar" : `${data.length} registos`}</span>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      {!loading && !data.length ? (
        <EmptyState title="Sem consentimentos" message="Os consentimentos do piloto aparecem aqui." />
      ) : (
        <div className={styles.requestList}>
          {data.slice(0, 8).map((item) => (
            <div className={styles.requestRow} key={item.id}>
              <span className="pill green">{item.role}</span>
              <strong>{label(item.consent_type)}</strong>
              <span className="muted">{item.version} · {item.page} · {item.accepted_at.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function label(type: string) {
  if (type === "donor_onboarding") return "Consentimento do dador";
  if (type === "hospital_responsibility") return "Responsabilidade hospitalar";
  return type;
}
