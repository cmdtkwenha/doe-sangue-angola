"use client";

import type { Hospital } from "@doe-sangue-angola/shared-types";
import { analyticsEvents } from "@doe-sangue-angola/shared-services";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../auth/useAuth";
import { HospitalRegistrationForm } from "./HospitalRegistrationForm";
import { OnboardingShell } from "./OnboardingShell";
import styles from "./onboarding.module.css";

type HospitalRow = {
  address?: string | null;
  capacity?: number | null;
  contact?: string | null;
  email?: string | null;
  facility_type?: string | null;
  hospital_type?: string | null;
  institutional_email?: string | null;
  id: string;
  license_number?: string | null;
  municipality: string;
  name: string;
  phone?: string | null;
  province: string;
  responsible_person?: string | null;
  rejection_reason?: string | null;
  type?: string | null;
  status?: string | null;
  verified?: boolean | null;
  verification_status?: string | null;
};

export function HospitalOnboarding() {
  const { session } = useAuth();
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [mode, setMode] = useState<"register" | "select">("select");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const approved = hospitals.filter((hospital) => hospital.verified && isVerified(hospital.verificationStatus));
  const [hospitalId, setHospitalId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Escolha um hospital aprovado.");
  const [responsibilityAccepted, setResponsibilityAccepted] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setError("Serviço de dados não configurado.");
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
        if (error) throw new Error(error.message);
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

  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!session?.user.id || !hospitalId || !responsibilityAccepted) {
      setMessage("Selecione um hospital aprovado antes de continuar.");
      return;
    }
    if (!supabase) {
      setMessage("Serviço de dados não configurado.");
      return;
    }
    setSaving(true);
    setMessage("A ligar conta ao hospital selecionado...");
    try {
      const response = await fetch("/api/hospitals/onboarding", {
        body: JSON.stringify({ hospitalId, mode: "select" }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok === false) throw new Error(payload?.message ?? "Não foi possível ligar o hospital.");
      await supabase.auth.refreshSession();
      analyticsEvents.onboardingCompleted("hospital");
      setMessage(payload?.data?.message ?? "Hospital ligado com sucesso.");
      router.refresh();
      setTimeout(() => router.replace("/hospital"), 500);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[hospital-onboarding] Falha ao ligar hospital", error);
      }
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
      <div className={styles.actions}>
        <button className={mode === "select" ? "button" : styles.secondary} onClick={() => setMode("select")} type="button">
          Selecionar hospital aprovado
        </button>
        <button className={mode === "register" ? "button" : styles.secondary} onClick={() => setMode("register")} type="button">
          Registar novo hospital ou clínica
        </button>
      </div>
      {mode === "register" ? <HospitalRegistrationForm /> : null}
      {mode === "select" ? (
      <form className={styles.summary} onSubmit={save}>
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
        <label className={styles.consentBox}>
          <input
            checked={responsibilityAccepted}
            onChange={(event) => setResponsibilityAccepted(event.target.checked)}
            type="checkbox"
          />
          <span>
            Confirmo que o hospital é responsável por validar identidade, elegibilidade clínica,
            PIN, documentação e segurança antes de concluir qualquer doação.
          </span>
        </label>
        <button
          className="button"
          disabled={saving || !hospitalId || !responsibilityAccepted}
          type="submit"
        >
          {saving ? "A ligar conta..." : "Ligar conta"}
        </button>
        <span className="muted" role="status">{message}</span>
      </form>
      ) : null}
    </OnboardingShell>
  );
}

function mapHospital(row: HospitalRow): Hospital {
  return {
    id: row.id,
    address: row.address ?? undefined,
    capacity: row.capacity ?? 0,
    contact: row.responsible_person ?? row.contact ?? row.phone ?? "",
    email: row.institutional_email ?? row.email ?? undefined,
    licenseNumber: row.license_number ?? undefined,
    municipality: row.municipality,
    name: row.name,
    province: row.province,
    rejectionReason: row.rejection_reason ?? undefined,
    type: row.hospital_type ?? row.facility_type ?? row.type ?? "Hospital",
    verified: Boolean(row.verified),
    verificationStatus: normalizeHospitalStatus(row)
  };
}

function normalizeHospitalStatus(row: HospitalRow) {
  const value = row.status ?? row.verification_status;
  if (value === "Pendente" || value === "Verificado" || value === "Rejeitado" || value === "Suspenso" || value === "Revisão Necessária") return value;
  if (value === "pending" || value === "verified" || value === "rejected" || value === "suspended" || value === "needs_review") return value;
  return row.verified ? "Verificado" : "Pendente";
}

function isVerified(status?: string) {
  return status === "Verificado" || status === "verified";
}
