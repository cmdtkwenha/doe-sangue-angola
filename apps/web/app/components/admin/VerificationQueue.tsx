"use client";

import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "../../hooks/useApiData";
import { useSupabaseRealtimeVersion } from "../../hooks/useSupabaseRealtimeVersion";
import styles from "./adminAdvanced.module.css";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

export function VerificationQueue() {
  const version = useSupabaseRealtimeVersion(["hospitals"]);
  const { data: hospitals, error } = useApiData<Hospital[]>("/api/hospitals", [], version);
  const queue = hospitals
    .filter((item) => item.verificationStatus !== "verified")
    .slice(0, 5);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Verificação de Entidades</strong>
        <a className="muted" href="/admin/hospitals">Ver todos</a>
      </div>
      {error ? <p className="muted">Falha ao carregar fila: {error}</p> : null}
      {queue.map((hospital) => (
        <article className={styles.row} key={hospital.id}>
          <div className={styles.rowTop}>
            <strong>{hospital.name}</strong>
            <VerificationStatusBadge status={statusLabel(hospital)} />
          </div>
          <span className="muted">{hospital.type ?? "Hospital"} · {hospital.province} · {hospital.rejectionReason ?? "A aguardar revisão"}</span>
        </article>
      ))}
    </section>
  );
}

function statusLabel(hospital: Hospital) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    rejected: "Rejeitado",
    suspended: "Suspenso"
  };
  return labels[hospital.verificationStatus ?? "pending"] ?? "Pendente";
}
