"use client";

import { useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { EmptyState } from "../../ui/EmptyState";
import { ManagementTable } from "./ManagementTable";

type FamilyRequest = {
  blood_request_id?: string | null;
  blood_type: string;
  contact_name: string;
  contact_phone: string;
  created_at: string;
  hospital_name: string;
  id: string;
  municipality: string;
  patient_name: string;
  province: string;
  relationship: string;
  status: string;
  units_needed: number;
  urgency: string;
};

export function FamilyRequestsReview() {
  const [version, setVersion] = useState(0);
  const liveVersion = useSupabaseRealtimeVersion(["family_emergency_requests", "blood_requests"]);
  const { data: requests, error, loading } = useApiData<FamilyRequest[]>("/api/family-requests", [], version + liveVersion);
  async function review(id: string, action: "approved" | "cancelled" | "more_info") {
    const note = action === "approved" ? "" : window.prompt("Motivo ou informação necessária") ?? "";
    const response = await fetch("/api/family-requests", {
      body: JSON.stringify({ action, id, note }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    });
    const payload = await response.json() as { message?: string; ok: boolean };
    if (!payload.ok) window.alert(payload.message ?? "Não foi possível rever pedido familiar.");
    setVersion((value) => value + 1);
  }
  const summary = familySummary(requests);

  return (
    <section>
      <div className="grid metrics">
        <article className="panel"><strong>{requests.length}</strong><span> pedidos familiares</span></article>
        <article className="panel"><strong>{summary.fulfilled}</strong><span> resolvidos</span></article>
        <article className="panel"><strong>{summary.provinces}</strong><span> províncias</span></article>
      </div>
      {loading ? <p className="muted">A carregar pedidos familiares...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {!loading && !requests.length ? (
        <EmptyState title="Sem pedidos familiares" message="Novos pedidos públicos aparecem aqui para revisão." />
      ) : (
        <ManagementTable
          title="Revisão de Pedidos Familiares"
          exportName="pedidos-familiares.csv"
          columns={["Paciente", "Hospital", "Província", "Tipo", "Contacto"]}
          rows={requests.map((request) => ({
            id: request.id,
            status: statusLabel(request.status),
            values: {
              Contacto: `${request.contact_name} · ${request.contact_phone}`,
              Hospital: request.hospital_name,
              Paciente: request.patient_name,
              Província: `${request.municipality}, ${request.province}`,
              Tipo: `${request.blood_type} · ${request.units_needed} bolsas`
            },
            actions: ["Aprovar", "Rejeitar", "Pedir informação"],
            onAction: (label) => {
              const action = label === "Aprovar" ? "approved" : label === "Rejeitar" ? "cancelled" : "more_info";
              void review(request.id, action);
            }
          }))}
        />
      )}
    </section>
  );
}

function statusLabel(status: string) {
  return {
    active: "Ativo",
    approved: "Aprovado",
    cancelled: "Cancelado",
    fulfilled: "Resolvido",
    pending_review: "Em revisão"
  }[status] ?? status;
}

function familySummary(requests: FamilyRequest[]) {
  return {
    fulfilled: requests.filter((item) => item.status === "fulfilled").length,
    provinces: new Set(requests.map((item) => item.province).filter(Boolean)).size
  };
}
