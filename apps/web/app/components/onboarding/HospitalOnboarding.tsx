"use client";

import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../auth/useAuth";
import { OnboardingShell } from "./OnboardingShell";
import styles from "./onboarding.module.css";

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

export function HospitalOnboarding() {
  const { session } = useAuth();
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const approved = hospitals.filter((hospital) => hospital.verified);
  const [hospitalId, setHospitalId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Escolha um hospital aprovado.");

  useEffect(() => {
    if (!supabase) {
      setError("Supabase não configurado no frontend.");
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    void loadHospitals();

    async function loadHospitals() {
      try {
        const { data, error } = await supabase!
          .from("hospitals")
          .select("*")
          .order("name");
        if (!active) return;
        if (error) throw new Error(formatSupabaseError(error));
        setHospitals((data as HospitalRow[]).map(mapHospital));
      } catch (queryError) {
        if (!active) return;
        setHospitals([]);
        setError(queryError instanceof Error ? queryError.message : String(queryError));
      } finally {
        if (active) setLoading(false);
      }
    }

    return () => {
      active = false;
    };
  }, []);

  async function save() {
    if (!session?.user.id || !hospitalId) {
      setMessage("Selecione um hospital aprovado antes de continuar.");
      return;
    }
    setSaving(true);
    setMessage("A ligar conta ao hospital selecionado...");
    try {
      const response = await fetch("/api/hospitals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId, userId: session.user.id })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.message ?? "Não foi possível ligar o hospital.");
      }
      setMessage("Conta ligada ao hospital aprovado. A abrir painel...");
      router.replace("/hospital");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível ligar o hospital.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingShell
      role="hospital"
      subtitle="Escolha o hospital aprovado antes de criar pedidos de sangue."
      title="Configurar hospital verificado"
    >
      <aside className={styles.summary}>
        <div>
          <div className="eyebrow">Lista aprovada</div>
          <h2>Hospital da conta</h2>
        </div>
        <label className="eyebrow">Hospital ou clínica</label>
        <select
          className={styles.input}
          disabled={loading}
          onChange={(event) => setHospitalId(event.target.value)}
          value={hospitalId}
        >
          <option value="">{loading ? "A carregar..." : "Selecione"}</option>
          {approved.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name} · {hospital.municipality}, {hospital.province}
            </option>
          ))}
        </select>
        {loading ? <span className="muted">A carregar hospitais aprovados...</span> : null}
        {error ? <span className="muted">{error}</span> : null}
        {!loading && approved.length === 0 ? (
          <span className="muted">Nenhum hospital aprovado encontrado.</span>
        ) : null}
        <button
          className="button"
          disabled={saving || loading || !hospitalId}
          onClick={save}
          type="button"
        >
          {saving ? "A guardar..." : "Ligar conta"}
        </button>
        <span className="muted">{message}</span>
      </aside>
    </OnboardingShell>
  );
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
