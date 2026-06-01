"use client";

import { hospitalActions } from "@constants/adminActions";
import type { BloodRequest, Hospital } from "@doe-sangue-angola/shared-types";
import { useEffect, useState } from "react";
import { useApiData } from "../../../hooks/useApiData";
import { supabase } from "../../../../lib/supabaseClient";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { ManagementTable } from "./ManagementTable";
import styles from "./management.module.css";

type HospitalRow = {
  address?: string | null;
  capacity?: number | null;
  contact?: string | null;
  email?: string | null;
  facility_type?: string | null;
  id: string;
  license_number?: string | null;
  municipality: string;
  name: string;
  phone?: string | null;
  province: string;
  rejection_reason?: string | null;
  type?: string | null;
  verified?: boolean | null;
  verification_status?: string | null;
};
type UserRow = { id: string; linked_entity_id?: string | null; name?: string; role: string };
type UsersPayload = { users: UserRow[] };
type Pending = { action: string; email?: string; hospital: Hospital; title: string } | null;

export function HospitalsTable() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const { data: requests } = useApiData<BloodRequest[]>("/api/blood-requests", [], hospitals.length);
  const { data: usersPayload } = useApiData<UsersPayload>("/api/admin/users", { users: [] }, hospitals.length);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<Pending>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setHospitals([]);
      setError("Serviço de dados não configurado.");
      return;
    }

    let active = true;
    setError("");
    void loadSupabaseHospitals().then((data) => {
      if (!active) return;
      setHospitals(data);
      setError("");
    }).catch((queryError: unknown) => {
      if (!active) return;
      const message = queryError instanceof Error ? queryError.message : String(queryError);
      setHospitals([]);
      setError(message);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {error ? <p className={styles.error}>Falha ao carregar hospitais: {error}</p> : null}
      {message ? <p className="muted" role="status">{message}</p> : null}
      <ManagementTable
        disableFilters
        title="Hospitais e Clínicas"
        exportName="hospitais.csv"
        columns={["Hospital", "Tipo", "Província", "Município", "Licença", "Utilizadores", "Pedidos"]}
        rows={hospitals.map((hospital) => ({
          id: hospital.id,
          status: statusLabel(hospital),
          values: {
            Hospital: hospital.name,
            Tipo: hospital.type ?? "Hospital",
            Província: hospital.province,
            Município: hospital.municipality,
            Licença: hospital.licenseNumber ?? "",
            Utilizadores: linkedUsers(usersPayload.users, hospital.id),
            Pedidos: String(requests.filter((item) => item.hospitalId === hospital.id).length)
          },
          actions: hospitalActions,
          onAction: (action) => queueAction(hospital, action)
        }))}
      />
      <ConfirmationModal
        confirmLabel="Confirmar"
        loading={saving}
        message={pending ? `Confirmar "${pending.action}" para ${pending.hospital.name}?` : ""}
        onClose={() => setPending(null)}
        onConfirm={() => void runPending()}
        open={Boolean(pending)}
        title={pending?.title ?? "Confirmar ação"}
        tone="danger"
      />
    </>
  );

  async function runPending() {
    if (!pending) return;
    const apiAction = actionMap[pending.action];
    if (!apiAction) return;
    const reason = reasonFor(apiAction);
    if (reason === null) return;
    setSaving(true);
    setMessage("A atualizar verificação do hospital...");
    const response = await fetch("/api/admin/verification", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: apiAction, email: pending.email, hospitalId: pending.hospital.id, reason })
    });
    setSaving(false);
    setPending(null);
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.ok === false) {
      setMessage(payload?.message ?? "Não foi possível atualizar o hospital.");
      return;
    }
    setMessage("Estado do hospital atualizado.");
    const data = await loadSupabaseHospitals();
    setHospitals(data);
  }

  function queueAction(hospital: Hospital, action: string) {
    if (action === "Ligar utilizador" || action === "Desligar utilizador") {
      const email = window.prompt("Email do utilizador hospitalar:")?.trim();
      if (!email) return;
      setPending({ action, email, hospital, title: action });
      return;
    }
    setPending({ action, hospital, title: action });
  }
}

const actionMap: Record<string, string> = {
  "Aprovar hospital": "approve_hospital",
  "Pedir revisão": "review_hospital",
  "Reativar hospital": "reactivate_hospital",
  "Rejeitar hospital": "reject_hospital",
  "Suspender hospital": "suspend_hospital",
  "Ligar utilizador": "link_hospital_user",
  "Desligar utilizador": "unlink_hospital_user"
};

function reasonFor(action: string) {
  if (action === "approve_hospital" || action === "reactivate_hospital") return undefined;
  return window.prompt("Informe o motivo para o hospital:")?.trim() || null;
}

function statusLabel(hospital: Hospital) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    rejected: "Rejeitado",
    needs_review: "Revisão necessária",
    suspended: "Suspenso",
    verified: "Verificado"
  };
  return labels[String(hospital.verificationStatus ?? (hospital.verified ? "verified" : "pending"))];
}

function linkedUsers(users: UserRow[], hospitalId: string) {
  const linked = users.filter((user) => user.role === "hospital" && user.linked_entity_id === hospitalId);
  return linked.map((user) => user.name ?? "Utilizador").join(", ") || "Sem ligação";
}

async function loadSupabaseHospitals() {
  const response = await supabase!
    .from("hospitals")
    .select("*");

  if (response.error) {
    throw new Error(formatSupabaseError(response.error));
  }

  return (response.data as HospitalRow[]).map(mapHospital);
}

function formatSupabaseError(error: {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}) {
  return error.message;
}

function mapHospital(row: HospitalRow): Hospital {
  return {
    id: row.id,
    address: row.address ?? undefined,
    capacity: row.capacity ?? 0,
    contact: row.contact ?? row.phone ?? "",
    email: row.email ?? undefined,
    licenseNumber: row.license_number ?? undefined,
    municipality: row.municipality,
    name: row.name,
    province: row.province,
    rejectionReason: row.rejection_reason ?? undefined,
    type: row.facility_type ?? row.type ?? "Hospital",
    verified: Boolean(row.verified),
    verificationStatus: normalizeHospitalStatus(row)
  };
}

function normalizeHospitalStatus(row: HospitalRow) {
  const value = row.verification_status;
  if (value === "needs_review" || value === "pending" || value === "verified" || value === "rejected" || value === "suspended") return value;
  return row.verified ? "verified" : "pending";
}
