"use client";

import { hospitalActions } from "@constants/adminActions";
import { getDataMode } from "@doe-sangue-angola/shared-services";
import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useEffect, useState } from "react";
import { supabase, supabaseUrl } from "../../../../lib/supabaseClient";
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
  type?: string | null;
  verified?: boolean | null;
};

export function HospitalsTable() {
  const dataMode = getDataMode();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setHospitals([]);
      setLoading(false);
      setError("Supabase não configurado no frontend.");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    void loadSupabaseHospitals().then((data) => {
      if (!active) return;
      console.info("[admin-hospitals] supabase.from('hospitals') result", {
        count: data.length
      });
      setHospitals(data);
      setError("");
      setLoading(false);
    }).catch((queryError: unknown) => {
      if (!active) return;
      const message = queryError instanceof Error ? queryError.message : String(queryError);
      console.error("[admin-hospitals] query error", queryError);
      setHospitals([]);
      setError(message);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className={styles.debug}>
        <strong>Debug temporário</strong>
        <span>NEXT_PUBLIC_SUPABASE_URL: {supabaseUrl ?? "em falta"}</span>
        <span>DATA_MODE: {dataMode}</span>
        <span>Supabase configurado: {supabase ? "sim" : "não"}</span>
        <span>Tabela: hospitals</span>
        <span>Query: supabase.from("hospitals").select("*")</span>
        <span>Hospitais carregados: {hospitals.length}</span>
        <span>Estado: {loading ? "A carregar" : "Pronto"}</span>
        {error ? <span>Erro Supabase: {error}</span> : <span>Erro Supabase: nenhum</span>}
      </div>
      {error ? <p className={styles.error}>Falha ao carregar hospitais: {error}</p> : null}
      <ManagementTable
        disableFilters
        title="Hospitais e Clínicas"
        exportName="hospitais.csv"
        columns={["Hospital", "Tipo", "Província", "Município", "Licença", "Contacto"]}
        rows={hospitals.map((hospital) => ({
          id: hospital.id,
          status: hospital.verified ? "Verificado" : "Pendente",
          values: {
            Hospital: hospital.name,
            Tipo: hospital.type ?? "Hospital",
            Província: hospital.province,
            Município: hospital.municipality,
            Licença: hospital.licenseNumber ?? "",
            Contacto: hospital.contact
          },
          actions: hospitalActions
        }))}
      />
    </>
  );
}

async function loadSupabaseHospitals() {
  const response = await supabase!
    .from("hospitals")
    .select("*");

  if (response.error) {
    console.error("[admin-hospitals] query error", response.error);
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
  return [
    error.message,
    error.code ? `Código: ${error.code}` : "",
    error.details ? `Detalhes: ${error.details}` : "",
    error.hint ? `Sugestão: ${error.hint}` : ""
  ].filter(Boolean).join(" | ");
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
    type: row.facility_type ?? row.type ?? "Hospital",
    verified: Boolean(row.verified)
  };
}
