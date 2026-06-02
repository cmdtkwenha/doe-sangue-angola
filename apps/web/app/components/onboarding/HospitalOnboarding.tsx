"use client";

import type { Hospital } from "@doe-sangue-angola/shared-types";
import { analyticsEvents } from "@doe-sangue-angola/shared-services";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
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
  rejection_reason?: string | null;
  type?: string | null;
  verified?: boolean | null;
  verification_status?: string | null;
};

export function HospitalOnboarding() {
  const { session } = useAuth();
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
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
      const { data: auth } = await supabase.auth.getUser();
      const authUser = auth.user;
      if (!authUser?.id) throw new Error("Sessão inválida. Entre novamente.");
      const { data: hospital, error: hospitalError } = await supabase
        .from("hospitals")
        .select("id,verified,verification_status")
        .eq("id", hospitalId)
        .eq("verified", true)
        .single();
      if (hospitalError) throw new Error(formatSupabaseError(hospitalError));
      if (!hospital?.id || !isVerified(String(hospital.verification_status ?? ""))) {
        throw new Error("Hospital aprovado não encontrado.");
      }

      const profilePayload = {
        auth_user_id: authUser.id,
        email: authUser.email ?? session.user.email,
        linked_entity_id: hospitalId,
        name: session.user.name || authUser.email || "Hospital",
        role: "hospital"
      };
      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update(profilePayload)
        .eq("auth_user_id", authUser.id)
        .select("id")
        .maybeSingle();
      if (updateError) throw new Error(formatSupabaseError(updateError));

      if (!updated?.id) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert(profilePayload);
        if (insertError) throw new Error(formatSupabaseError(insertError));
      }

      const { data: profile, error: verifyError } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();
      if (verifyError) throw new Error(formatSupabaseError(verifyError));
      if (profile?.role !== "hospital" || profile.linked_entity_id !== hospitalId) {
        throw new Error("Perfil criado, mas o hospital ainda não ficou ligado.");
      }
      await supabase.from("legal_consents").insert({
        consent_type: "hospital_responsibility",
        page: "/onboarding/hospital",
        role: "hospital",
        user_id: authUser.id,
        version: "pilot-v1"
      });
      await supabase.auth.refreshSession();
      analyticsEvents.onboardingCompleted("hospital");
      setMessage("Hospital ligado com sucesso.");
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
    rejectionReason: row.rejection_reason ?? undefined,
    type: row.facility_type ?? row.type ?? "Hospital",
    verified: Boolean(row.verified),
    verificationStatus: normalizeHospitalStatus(row)
  };
}

function normalizeHospitalStatus(row: HospitalRow) {
  const value = row.verification_status;
  if (value === "Pendente" || value === "Verificado" || value === "Rejeitado" || value === "Suspenso" || value === "Revisão Necessária") return value;
  if (value === "pending" || value === "verified" || value === "rejected" || value === "suspended" || value === "needs_review") return value;
  return row.verified ? "Verificado" : "Pendente";
}

function isVerified(status?: string) {
  return status === "Verificado" || status === "verified";
}

function formatSupabaseError(error: {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}) {
  return error.message;
}
