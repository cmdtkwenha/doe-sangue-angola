"use client";

import { hospitalActions } from "@constants/adminActions";
import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
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

export function HospitalsTable() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
        columns={["Hospital", "Tipo", "Província", "Município", "Licença", "Contacto", "Motivo"]}
        rows={hospitals.map((hospital) => ({
          id: hospital.id,
          status: statusLabel(hospital),
          values: {
            Hospital: hospital.name,
            Tipo: hospital.type ?? "Hospital",
            Província: hospital.province,
            Município: hospital.municipality,
            Licença: hospital.licenseNumber ?? "",
            Contacto: hospital.contact,
            Motivo: hospital.rejectionReason ?? ""
          },
          actions: hospitalActions,
          onAction: (action) => void handleAction(hospital, action)
        }))}
      />
    </>
  );

  async function handleAction(hospital: Hospital, action: string) {
    const apiAction = actionMap[action];
    if (!apiAction) return;
    const reason = reasonFor(apiAction);
    if (reason === null) return;
    setMessage("A atualizar verificação do hospital...");
    const response = await fetch("/api/hospitals/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: apiAction, hospitalId: hospital.id, reason })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.ok === false) {
      setMessage(payload?.message ?? "Não foi possível atualizar o hospital.");
      return;
    }
    setMessage("Estado do hospital atualizado.");
    const data = await loadSupabaseHospitals();
    setHospitals(data);
  }
}

const actionMap: Record<string, "approve" | "reject" | "suspend" | "reactivate"> = {
  "Aprovar hospital": "approve",
  "Reativar hospital": "reactivate",
  "Rejeitar hospital": "reject",
  "Suspender hospital": "suspend"
};

function reasonFor(action: "approve" | "reject" | "suspend" | "reactivate") {
  if (action === "approve" || action === "reactivate") return undefined;
  return window.prompt("Informe o motivo para o hospital:")?.trim() || null;
}

function statusLabel(hospital: Hospital) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    rejected: "Rejeitado",
    suspended: "Suspenso",
    verified: "Verificado"
  };
  return labels[hospital.verificationStatus ?? (hospital.verified ? "verified" : "pending")];
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
  if (value === "pending" || value === "verified" || value === "rejected" || value === "suspended") return value;
  return row.verified ? "verified" : "pending";
}
