"use client";

import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { useState } from "react";
import { ActionToast } from "../ui/ActionToast";
import { ConfirmationModal } from "../ui/ConfirmationModal";
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
type WorkflowStatus = Exclude<DonorResponseStatus, "accepted">;
type PendingAction = { row: AcceptedDonor; status: WorkflowStatus } | null;
const cancelReasons = ["Dador cancelou", "PIN inválido", "Pedido encerrado", "Outro motivo"];

export function IncomingDonorsList() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "blood_requests"]);
  const [message, setMessage] = useState("Aguardando dadores aceites.");
  const [pending, setPending] = useState<PendingAction>(null);
  const [pins, setPins] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success"
  });
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: rows, loading, error } = useApiData<AcceptedDonor[]>(
    hospitalId ? "/api/hospital/accepted-donors" : "/api/appointments?hospitalId=missing",
    [],
    version + liveVersion
  );

  function ask(row: AcceptedDonor, status: WorkflowStatus) {
    if (status === "pin_validated" && !/^\d{4}$/.test(pins[row.responseId] ?? "")) {
      showToast("Introduza o PIN de 4 dígitos informado pelo dador.", "error");
      return;
    }
    setReason("");
    setPending({ row, status });
  }

  async function update() {
    if (!pending) return;
    const { row, status } = pending;
    setSaving(true);
    setMessage("A atualizar estado do dador...");
    const response = await fetch("/api/donor-responses/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirmationPin: pins[row.responseId],
        reason,
        responseId: row.responseId,
        status
      })
    });
    const payload = await response.json().catch(() => null);
    const ok = Boolean(payload?.ok);
    const text = ok ? "Estado atualizado com sucesso." : payload?.message ?? "Falha ao atualizar.";
    setMessage(text);
    showToast(text, ok ? "success" : "error");
    if (ok) setPending(null);
    setSaving(false);
  }

  function showToast(message: string, tone: "error" | "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast({ message: "", tone: "success" }), 3200);
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
            <span className="pill red">{row.pin}<br /><span className={styles.rowMuted}>{statusLabel(row.status)}</span></span>
            <span className={styles.actions}>
              <button disabled={saving} onClick={() => ask(row, "arrived")} type="button">Chegou</button>
              <input
                aria-label="PIN do dador"
                disabled={saving}
                inputMode="numeric"
                maxLength={4}
                onChange={(event) => setPins({ ...pins, [row.responseId]: event.target.value })}
                placeholder="PIN"
                value={pins[row.responseId] ?? ""}
              />
              <button disabled={saving} onClick={() => ask(row, "pin_validated")} type="button">PIN validado</button>
              <button disabled={saving} onClick={() => ask(row, "completed")} type="button">Doação concluída</button>
              <button disabled={saving} onClick={() => ask(row, "cancelled")} type="button">Cancelado</button>
            </span>
          </article>
          ))}
        </div>
      )}
      <ConfirmationModal
        confirmLabel={pending ? statusLabel(pending.status) : "Confirmar"}
        loading={saving}
        message={pending ? confirmMessage(pending) : ""}
        onClose={() => !saving && setPending(null)}
        onConfirm={() => void update()}
        open={Boolean(pending)}
        reason={reason}
        reasonOptions={pending?.status === "cancelled" ? cancelReasons : []}
        setReason={setReason}
        title="Confirmar atualização"
        tone={pending?.status === "cancelled" ? "danger" : "primary"}
      />
      <ActionToast message={toast.message} tone={toast.tone} />
      <a className={styles.footerLink} href="/hospital/donors">Ver todos os dadores</a>
    </section>
  );
}

function confirmMessage(action: NonNullable<PendingAction>) {
  return `Tem certeza que deseja marcar ${action.row.donorName} como "${statusLabel(action.status)}"?`;
}

function formatTime(value?: string) {
  if (!value) return "hora pendente";
  return new Date(value).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: "Dador a Caminho",
    arrived: "Chegou",
    cancelled: "Cancelado",
    completed: "Doação concluída",
    pin_validated: "PIN Validado"
  };
  return labels[status] ?? status;
}
