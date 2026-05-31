"use client";

import { useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";

type FamilyRequest = {
  blood_request_id?: string | null;
  blood_type: string;
  hospital_name: string;
  id: string;
  municipality: string;
  patient_name: string;
  province: string;
  units_needed: number;
  urgency: string;
};

export function FamilyRequestsAdoptionPanel() {
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState("");
  const live = useSupabaseRealtimeVersion(["family_emergency_requests", "blood_requests"]);
  const { data: requests, error, loading } = useApiData<FamilyRequest[]>("/api/family-requests?status=approved", [], version + live);
  const open = requests.filter((item) => !item.blood_request_id);

  async function adopt(id: string) {
    setBusy(id);
    const response = await fetch("/api/family-requests/adopt", {
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json() as { message?: string; ok: boolean };
    if (!payload.ok) window.alert(payload.message ?? "Não foi possível adotar pedido familiar.");
    setBusy("");
    setVersion((value) => value + 1);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Pedidos Familiares Aprovados</strong>
        <span className="pill gold">Opcional</span>
      </div>
      {loading ? <p className={styles.rowMuted}>A carregar pedidos familiares...</p> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      {!open.length ? (
        <EmptyState title="Sem pedidos para adoção" message="Pedidos familiares aprovados aparecerão aqui." />
      ) : (
        <div className={styles.table}>
          {open.map((request) => (
            <article className={styles.requestRow} key={request.id}>
              <strong>{request.blood_type} · {request.units_needed}</strong>
              <span>{request.patient_name}<br /><small>{request.hospital_name}</small></span>
              <span>{request.municipality}, {request.province}</span>
              <button disabled={busy === request.id} onClick={() => adopt(request.id)} type="button">
                {busy === request.id ? "A assumir..." : "Assumir pedido"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
