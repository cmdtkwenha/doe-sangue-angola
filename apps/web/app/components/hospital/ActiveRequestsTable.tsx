"use client";

import {
  getRequestStatusLabel,
  isCompletedRequest
} from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { useEffect, useMemo, useState } from "react";
import { ActionToast } from "../ui/ActionToast";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { DonorResponseStatusBadge, normalizeDonorResponseStatus } from "../ui/DonorResponseStatusBadge";
import { EmptyState } from "../ui/EmptyState";
import { HospitalDonorDetailsModal } from "./HospitalDonorDetailsModal";
import styles from "./hospitalPortal.module.css";
import type { AcceptedDonor, WorkflowStatus } from "./incomingDonorTypes";
import { useCurrentHospital } from "./useCurrentHospital";
import { updateStatusAction } from "../workflow/workflowActions";

export function ActiveRequestsTable() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["blood_requests", "donor_responses", "donors", "users"]);
  const [closing, setClosing] = useState<BloodRequest | null>(null);
  const [closedIds, setClosedIds] = useState<string[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<AcceptedDonor | null>(null);
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
  const { data: acceptedDonors, error: donorsError } = useApiData<AcceptedDonor[]>(
    hospitalId ? "/api/hospital/accepted-donors" : "/api/appointments?hospitalId=missing",
    [],
    version + liveVersion
  );
  const donorsByRequest = useMemo(() => groupDonorsByRequest(acceptedDonors), [acceptedDonors]);

  useEffect(() => {
    if (!selectedDonor) return;
    const updated = acceptedDonors.find((donor) => donor.responseId === selectedDonor.responseId);
    if (updated && updated !== selectedDonor) setSelectedDonor(updated);
  }, [acceptedDonors, selectedDonor]);

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

  async function updateDonorStatus(row: AcceptedDonor, status: WorkflowStatus) {
    try {
      setSaving(true);
      const response = await fetch("/api/donor-responses/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseId: row.responseId, status })
      });
      const payload = await response.json().catch(() => null);
      const ok = Boolean(payload?.ok);
      showToast(ok ? "Estado do dador atualizado." : payload?.message ?? "Falha ao atualizar dador.", ok ? "success" : "error");
    } finally {
      setSaving(false);
    }
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
      {donorsError ? <p className={styles.rowMuted}>{donorsError}</p> : null}
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
            <AssignedDonors
              donors={donorsByRequest.get(request.id) ?? []}
              onOpen={setSelectedDonor}
            />
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
      <HospitalDonorDetailsModal
        donor={selectedDonor}
        onAction={(row, status) => void updateDonorStatus(row, status)}
        onClose={() => setSelectedDonor(null)}
        saving={saving}
      />
      <ActionToast message={toast.message} tone={toast.tone} />
      <a className={styles.footerLink} href="/hospital/requests">Ver todos os pedidos</a>
    </section>
  );
}

function AssignedDonors({ donors, onOpen }: {
  donors: AcceptedDonor[];
  onOpen: (donor: AcceptedDonor) => void;
}) {
  if (!donors.length) return null;
  return (
    <div style={{ display: "grid", gap: 8, gridColumn: "1 / -1" }}>
      <strong>{donors.length === 1 ? "1 dador a caminho" : `${donors.length} dadores a caminho`}</strong>
      {donors.map((donor) => (
        <div
          key={donor.responseId}
          style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 10 }}
        >
          <span>
            <strong>{donor.donorName}</strong>{" "}
            <span className={styles.rowMuted}>
              {donor.donorBloodType} · ETA {donor.eta} · Tel. {donor.donorPhone}
            </span>
          </span>
          <DonorResponseStatusBadge status={donor.status} />
          <span className={styles.rowMuted}>PIN: {pinStatusLabel(donor)}</span>
          <button className="button secondary" onClick={() => onOpen(donor)} type="button">
            Ver detalhes do dador
          </button>
        </div>
      ))}
    </div>
  );
}

function pinStatusLabel(donor: AcceptedDonor) {
  const status = normalizeDonorResponseStatus(donor.status);
  return status === "pin_validated" || status === "completed"
    ? "PIN Validado"
    : "Pendente";
}

function groupDonorsByRequest(donors: AcceptedDonor[]) {
  const groups = new Map<string, AcceptedDonor[]>();
  donors.forEach((donor) => {
    if (!donor.bloodRequestId) return;
    groups.set(donor.bloodRequestId, [...(groups.get(donor.bloodRequestId) ?? []), donor]);
  });
  return groups;
}

function statusTone(status: string) {
  if (status === "Aberto") return "pill red";
  if (isCompletedRequest(status)) return "pill green";
  return "pill gold";
}

function statusLabel(status: string) {
  return getRequestStatusLabel(status);
}
