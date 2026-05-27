"use client";

import {
  getRequestStatusLabel,
  isCompletedRequest
} from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { useState } from "react";
import { ActionToast } from "../ui/ActionToast";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";
import { updateStatusAction } from "../workflow/workflowActions";

export function ActiveRequestsTable() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["blood_requests", "donor_responses", "donors"]);
  const [closing, setClosing] = useState<BloodRequest | null>(null);
  const [closedIds, setClosedIds] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success"
  });
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: requests, error, loading } = useApiData<BloodRequest[]>(
    hospitalId ? `/api/blood-requests?hospitalId=${hospitalId}` : "/api/blood-requests?hospitalId=missing",
    [],
    version + liveVersion
  );

  async function closeRequest() {
    if (!closing) return;
    setSaving(true);
    setClosedIds((items) => [...new Set([...items, closing.id])]);
    const result = await updateStatusAction(closing.id, "Cancelado");
    const message = result.ok ? "Pedido fechado com sucesso." : result.message;
    showToast(message, result.ok ? "success" : "error");
    if (result.ok) setClosing(null);
    else setClosedIds((items) => items.filter((id) => id !== closing.id));
    setSaving(false);
  }

  function showToast(message: string, tone: "error" | "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast({ message: "", tone: "success" }), 3200);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Pedidos de Sangue Ativos</strong>
        <a className="muted" href="/hospital/requests">Ver todos</a>
      </div>
      {loading ? <p className={styles.rowMuted}>A sincronizar pedidos...</p> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      {requests.filter((request) => !closedIds.includes(request.id)).length === 0 ? (
        <EmptyState
          message="Crie um pedido urgente quando precisar de dadores compatíveis."
          title="Sem pedidos ativos"
        />
      ) : (
        <div className={styles.table}>
          {requests.filter((request) => !closedIds.includes(request.id)).map((request) => (
          <article className={styles.requestRow} key={request.id}>
            <div>
              <strong style={{ color: "#d01424", fontSize: 24 }}>{request.bloodType}</strong>
              <div className={styles.rowMuted}>{request.units} bolsas</div>
            </div>
            <span>ID: #{request.id}<br /><span className={styles.rowMuted}>UTI Geral</span></span>
            <span className={styles.rowMuted}>Criado<br /><strong>{request.createdAt.slice(11, 16)}</strong></span>
            <span className={statusTone(request.status)}>{statusLabel(request.status)}</span>
            {!isCompletedRequest(request.status) ? (
              <button
                className="button secondary"
                disabled={saving}
                onClick={() => {
                  setReason("");
                  setClosing(request);
                }}
                type="button"
              >
                Fechar
              </button>
            ) : null}
          </article>
          ))}
        </div>
      )}
      <ConfirmationModal
        confirmLabel="Fechar pedido"
        loading={saving}
        message={closing ? `Deseja fechar o pedido ${closing.bloodType} com ${closing.units} bolsas?` : ""}
        onClose={() => !saving && setClosing(null)}
        onConfirm={() => void closeRequest()}
        open={Boolean(closing)}
        reason={reason}
        reasonOptions={["Resolvido", "Pedido duplicado", "Sem necessidade clínica", "Outro motivo"]}
        setReason={setReason}
        title="Confirmar fecho do pedido"
        tone="danger"
      />
      <ActionToast message={toast.message} tone={toast.tone} />
      <a className={styles.footerLink} href="/hospital/requests">Ver todos os pedidos</a>
    </section>
  );
}

function statusTone(status: string) {
  if (status === "Aberto") return "pill red";
  if (isCompletedRequest(status)) return "pill green";
  return "pill gold";
}

function statusLabel(status: string) {
  return getRequestStatusLabel(status);
}
