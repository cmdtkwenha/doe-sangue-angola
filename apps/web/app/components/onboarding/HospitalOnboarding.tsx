"use client";

import type { Hospital } from "@doe-sangue-angola/shared-types";
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
  const [profileDebug, setProfileDebug] = useState("");

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
    if (!session?.user.id || !hospitalId) {
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
        .select("id,verified")
        .eq("id", hospitalId)
        .eq("verified", true)
        .single();
      if (hospitalError) throw new Error(formatSupabaseError(hospitalError));
      if (!hospital?.id) throw new Error("Hospital aprovado não encontrado.");

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
      setProfileDebug(
        `role: ${profile.role ?? "-"} · linked_entity_id: ${profile.linked_entity_id ?? "-"} · hospital_id: ${profile.hospital_id ?? "-"}`
      );

      await supabase.auth.refreshSession();
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
        <button
          className="button"
          disabled={saving || !hospitalId}
          type="submit"
        >
          {saving ? "A ligar conta..." : "Ligar conta"}
        </button>
        <span className="muted" role="status">{message}</span>
        {profileDebug ? <span className="muted">{profileDebug}</span> : null}
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
  return error.message;
}
