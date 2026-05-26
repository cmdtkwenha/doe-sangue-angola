"use client";

import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { useState } from "react";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

type AcceptedDonor = {
  bloodRequestId?: string;
  createdAt?: string;
  donorBloodType: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  eta: string;
  pin: string;
  responseId: string;
  requestBloodType: string;
  requestStatus: string;
  status: string;
};

export function IncomingDonorsList() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "blood_requests"]);
  const [message, setMessage] = useState("Aguardando dadores aceites.");
  const [pins, setPins] = useState<Record<string, string>>({});
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: rows, loading, error } = useApiData<AcceptedDonor[]>(
    hospitalId ? "/api/hospital/accepted-donors" : "/api/appointments?hospitalId=missing",
    [],
    version + liveVersion
  );

  async function update(row: AcceptedDonor, status: "Cancelado" | "Chegou" | "Concluído" | "PIN Validado") {
    setMessage("A atualizar estado do dador...");
    const response = await fetch("/api/donor-responses/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirmationPin: pins[row.responseId],
        responseId: row.responseId,
        status
      })
    });
    const payload = await response.json().catch(() => null);
    setMessage(payload?.ok ? "Estado atualizado com sucesso." : payload?.message ?? "Falha ao atualizar.");
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Dadores a Caminho</strong>
        <a className="muted" href="/hospital/donors">Lista ETA</a>
      </div>
      {loading ? <p className={styles.rowMuted}>A carregar dadores aceites...</p> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      <p className={styles.rowMuted}>{message}</p>
      {rows.length === 0 ? (
        <EmptyState
          message="Ainda não há dadores a caminho."
          title="Lista ETA vazia"
        />
      ) : (
        <div className={styles.table}>
          {rows.map((row) => (
          <article className={styles.donorRow} key={row.responseId}>
            <span>
              <strong>{row.donorName}</strong><br />
              <span className={styles.rowMuted}>
                {row.donorBloodType} · Tel. {row.donorPhone}
              </span>
              <br />
              <span className={styles.rowMuted}>
                Pedido {row.requestBloodType} · {row.requestStatus} · {formatTime(row.createdAt)}
              </span>
            </span>
            <strong style={{ color: "#008a45" }}>{row.eta}</strong>
            <span className="pill red">{row.pin}<br /><span className={styles.rowMuted}>{row.status}</span></span>
            <span className={styles.actions}>
              <button onClick={() => update(row, "Chegou")} type="button">Chegou</button>
              <input
                aria-label="PIN do dador"
                inputMode="numeric"
                maxLength={4}
                onChange={(event) => setPins({ ...pins, [row.responseId]: event.target.value })}
                placeholder="PIN"
                value={pins[row.responseId] ?? ""}
              />
              <button onClick={() => update(row, "PIN Validado")} type="button">PIN validado</button>
              <button onClick={() => update(row, "Concluído")} type="button">Doação concluída</button>
              <button onClick={() => update(row, "Cancelado")} type="button">Cancelado</button>
            </span>
          </article>
          ))}
        </div>
      )}
      <a className={styles.footerLink} href="/hospital/donors">Ver todos os dadores</a>
    </section>
  );
}

function formatTime(value?: string) {
  if (!value) return "hora pendente";
  return new Date(value).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
}
