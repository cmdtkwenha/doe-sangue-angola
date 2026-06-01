"use client";

import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { useState } from "react";
import { ActionToast } from "../ui/ActionToast";
import {
  canMoveDonorResponse,
  DonorResponseStatusBadge,
  donorResponseLabels,
  normalizeDonorResponseStatus
} from "../ui/DonorResponseStatusBadge";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { HospitalDonorDetailsModal } from "./HospitalDonorDetailsModal";
import styles from "./hospitalPortal.module.css";
import { formatTime, splitRows } from "./incomingDonorRows";
import type { AcceptedDonor, PendingAction, WorkflowStatus } from "./incomingDonorTypes";
import { useCurrentHospital } from "./useCurrentHospital";
const cancelReasons = ["Dador cancelou", "PIN inválido", "Pedido encerrado", "Outro motivo"];

export function IncomingDonorsList() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "blood_requests", "donors", "users"]);
  const [message, setMessage] = useState("Aguardando dadores aceites.");
  const [pending, setPending] = useState<PendingAction>(null);
  const [pins, setPins] = useState<Record<string, string>>({});
  const [optimistic, setOptimistic] = useState<Record<string, DonorResponseStatus>>({});
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState<AcceptedDonor | null>(null);
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
  const displayRows = rows.map((row) => ({
    ...row,
    status: optimistic[row.responseId] ?? normalizeDonorResponseStatus(row.status)
  }));
  const { activeRows, historyRows } = splitRows(displayRows);

  function ask(row: AcceptedDonor, status: WorkflowStatus) {
    const current = normalizeDonorResponseStatus(row.status);
    if (!canMoveDonorResponse(current, status)) {
      showToast(`Ação indisponível para ${donorResponseLabels[current]}.`, "error");
      return;
    }
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
    setOptimistic((current) => ({ ...current, [row.responseId]: status }));
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
    if (!ok) setOptimistic((current) => removeOptimistic(current, row.responseId));
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
      {loading ? <LoadingSkeleton label="A sincronizar dadores em tempo real" /> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      <p className={styles.rowMuted}>{message}</p>
      {activeRows.length === 0 ? (
        <EmptyState
          message="Ainda não há dadores a caminho."
          title="Lista ETA vazia"
        />
      ) : (
        <div className={styles.table}>
          {activeRows.map((row) => (
          <article className={styles.donorRow} key={row.responseId}>
            <span>
              <strong>{row.donorName}</strong><br />
              <span className={styles.rowMuted}>
                {row.donorBloodType} · Tel. {row.donorPhone}
              </span>
              <DonorDebug row={row} />
              <br />
              <span className={styles.rowMuted}>
                Pedido {row.requestBloodType} · {row.requestStatus} · {formatTime(row.createdAt)}
              </span>
            </span>
            <strong style={{ color: "#008a45" }}>{row.eta}</strong>
            <span>
              {row.pin}<br />
              <DonorResponseStatusBadge status={row.status} />
            </span>
            <span className={styles.actions}>
              <button disabled={saving || !canMoveDonorResponse(normalizeDonorResponseStatus(row.status), "arrived")} onClick={() => ask(row, "arrived")} type="button">Chegou</button>
              <button disabled={saving} onClick={() => setSelected(row)} type="button">Ver detalhes</button>
              <input
                aria-label="PIN do dador"
                disabled={saving}
                inputMode="numeric"
                maxLength={4}
                onChange={(event) => setPins({ ...pins, [row.responseId]: event.target.value })}
                placeholder="PIN"
                value={pins[row.responseId] ?? ""}
              />
              <button disabled={saving || !canMoveDonorResponse(normalizeDonorResponseStatus(row.status), "pin_validated")} onClick={() => ask(row, "pin_validated")} type="button">PIN validado</button>
              <button disabled={saving || !canMoveDonorResponse(normalizeDonorResponseStatus(row.status), "completed")} onClick={() => ask(row, "completed")} type="button">Doação concluída</button>
              <button disabled={saving || !canMoveDonorResponse(normalizeDonorResponseStatus(row.status), "cancelled")} onClick={() => ask(row, "cancelled")} type="button">Cancelado</button>
            </span>
          </article>
          ))}
        </div>
      )}
      {historyRows.length > 0 ? (
        <div className={styles.table}>
          <strong>Histórico</strong>
          {historyRows.map((row) => (
            <article className={styles.donorRow} key={row.responseId}>
              <span>
                <strong>{row.donorName}</strong><br />
                <span className={styles.rowMuted}>
                  Pedido {row.requestBloodType} · {formatTime(row.createdAt)}
                </span>
                <DonorDebug row={row} />
              </span>
              <span>{row.eta}</span>
              <DonorResponseStatusBadge status={row.status} />
            </article>
          ))}
        </div>
      ) : null}
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
      <HospitalDonorDetailsModal
        donor={selected}
        onAction={(row, status) => {
          setSelected(null);
          ask(row, status);
        }}
        onClose={() => setSelected(null)}
        saving={saving}
      />
      <a className={styles.footerLink} href="/hospital/donors">Ver todos os dadores</a>
    </section>
  );
}

function DonorDebug({ row }: { row: AcceptedDonor }) {
  if (process.env.NODE_ENV === "production" || !row.donorDebug) return null;
  return (
    <span className={styles.rowMuted}>
      donor_id: {row.donorDebug.donor_id} · donor_user_id: {row.donorDebug.donor_user_id ?? "-"} · resolved_user_name: {row.donorDebug.resolved_user_name} · data_source: {row.donorDebug.data_source}
    </span>
  );
}

function confirmMessage(action: NonNullable<PendingAction>) {
  return `Tem certeza que deseja marcar ${action.row.donorName} como "${statusLabel(action.status)}"?`;
}

function removeOptimistic(
  current: Record<string, DonorResponseStatus>,
  responseId: string
) {
  const next = { ...current };
  delete next[responseId];
  return next;
}

function statusLabel(status: string) {
  return donorResponseLabels[normalizeDonorResponseStatus(status)];
}
