"use client";

import type { BloodType, Donor } from "@doe-sangue-angola/shared-types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { getMissingDonorFields, isDonorProfileComplete } from "../mobile/useCurrentDonor";
import { DonorBirthDateSelect, isEligibleBirthDate } from "./DonorBirthDateSelect";
import { OnboardingShell } from "./OnboardingShell";
import styles from "./onboarding.module.css";

const bloodTypes: BloodType[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
const genders = ["Masculino", "Feminino"];

type DebugState = {
  authUserId: string;
  bloodType: string;
  exists: boolean;
  missingFields: string[];
  municipality: string;
  phone: string;
  profileComplete: boolean;
  province: string;
  redirectAttempted: boolean;
};

export function DonorOnboarding() {
  const { refreshSession, session } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    birthDate: "",
    bloodType: "O+" as BloodType,
    emergencyContactName: "",
    emergencyContactPhone: "",
    gender: "",
    municipality: "",
    phone: "",
    province: "Luanda"
  });
  const [debug, setDebug] = useState<DebugState | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Preencha os dados reais do dador.");

  async function save() {
    if (!session?.user.id) return setMessage("Sessão inválida. Entre novamente.");
    const missing = requiredFields(form);
    if (missing.length) {
      setMessage(`Complete: ${missing.join(", ")}.`);
      return;
    }
    if (!isEligibleBirthDate(form.birthDate)) {
      setMessage("O dador deve ter pelo menos 18 anos e uma data válida.");
      return;
    }
    setSaving(true);
    setDebug(null);
    setMessage("A guardar perfil...");
    try {
      const response = await fetch("/api/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          authUserId: session.user.authUserId ?? session.user.id,
          email: session.user.email,
          fullName: session.user.name,
          userId: session.user.id
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.message ?? "Não foi possível guardar o perfil.");
      }
      setMessage("Perfil guardado com sucesso. A abrir a aplicação...");
      await refreshSession();
      const authUserId = session.user.authUserId ?? session.user.id;
      const donor = await fetchDonor(authUserId);
      const nextDebug = toDebug(donor, authUserId, false);
      setDebug(nextDebug);
      if (!nextDebug.profileComplete) {
        throw new Error(`Perfil guardado, mas faltam campos: ${nextDebug.missingFields.join(", ")}.`);
      }
      router.refresh();
      setDebug({ ...nextDebug, redirectAttempted: true });
      router.replace("/mobile");
      window.setTimeout(() => {
        if (window.location.pathname.includes("/onboarding/donor")) {
          window.location.assign("/mobile");
        }
      }, 1400);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível guardar o perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingShell
      role="donor"
      subtitle="Complete os dados essenciais para receber pedidos compatíveis e doar com segurança."
      title="Preparar perfil de dador"
    >
      <aside className={styles.summary}>
        <div>
          <div className="eyebrow">Dados reais</div>
          <h2>Perfil de dador</h2>
        </div>
        <label className="eyebrow">Tipo sanguíneo</label>
        <select className={styles.input} value={form.bloodType} onChange={(event) =>
          setForm({ ...form, bloodType: event.target.value as BloodType })}>
          {bloodTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <Field label="Província" value={form.province} onChange={(province) => setForm({ ...form, province })} />
        <Field label="Município" value={form.municipality} onChange={(municipality) => setForm({ ...form, municipality })} />
        <Field label="Telefone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
        <label className="eyebrow">Género</label>
        <select className={styles.input} value={form.gender} onChange={(event) =>
          setForm({ ...form, gender: event.target.value })}>
          <option value="">Selecionar género</option>
          {genders.map((gender) => <option key={gender}>{gender}</option>)}
        </select>
        <Field label="Contacto de emergência" value={form.emergencyContactName} onChange={(emergencyContactName) =>
          setForm({ ...form, emergencyContactName })} />
        <Field label="Telefone de emergência" value={form.emergencyContactPhone} onChange={(emergencyContactPhone) =>
          setForm({ ...form, emergencyContactPhone })} />
        <label className="eyebrow">Data de nascimento</label>
        <DonorBirthDateSelect onChange={(birthDate) => setForm({ ...form, birthDate })} />
        <button className="button" disabled={saving} onClick={save} type="button">
          {saving ? "A guardar..." : "Guardar perfil"}
        </button>
        <span className="muted">{message}</span>
        {debug ? <DebugPanel debug={debug} /> : null}
      </aside>
    </OnboardingShell>
  );
}

async function fetchDonor(userId: string) {
  const response = await fetch(`/api/donors?userId=${encodeURIComponent(userId)}`, {
    cache: "no-store"
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message ?? "Não foi possível confirmar o perfil do dador.");
  }
  return payload.data as Donor | null;
}

function requiredFields(form: {
  birthDate: string;
  gender: string;
  municipality: string;
  phone: string;
  province: string;
}) {
  const fields = [
    ["província", form.province],
    ["município", form.municipality],
    ["telefone", form.phone],
    ["género", form.gender],
    ["data de nascimento", form.birthDate]
  ];

  return fields
    .filter(([, value]) => !String(value).trim())
    .map(([label]) => label);
}

function toDebug(donor: Donor | null, authUserId: string, redirectAttempted: boolean): DebugState {
  return {
    authUserId: donor?.authUserId ?? "-",
    bloodType: donor?.bloodType ?? "-",
    exists: Boolean(donor?.id),
    missingFields: getMissingDonorFields(donor, authUserId),
    municipality: donor?.municipality ?? "-",
    phone: donor?.phone ?? "-",
    profileComplete: isDonorProfileComplete(donor, authUserId),
    province: donor?.province ?? "-",
    redirectAttempted
  };
}

function DebugPanel({ debug }: { debug: DebugState }) {
  return (
    <div className={styles.field}>
      <div className="eyebrow">Debug temporário</div>
      <p className="muted">donor row exists: {debug.exists ? "yes" : "no"}</p>
      <p className="muted">auth_user_id: {debug.authUserId}</p>
      <p className="muted">missing fields: {debug.missingFields.join(", ") || "none"}</p>
      <p className="muted">blood_type: {debug.bloodType}</p>
      <p className="muted">province: {debug.province}</p>
      <p className="muted">municipality: {debug.municipality}</p>
      <p className="muted">phone: {debug.phone}</p>
      <p className="muted">profile complete: {debug.profileComplete ? "yes" : "no"}</p>
      <p className="muted">redirect attempted: {debug.redirectAttempted ? "yes" : "no"}</p>
    </div>
  );
}

function Field({ label, onChange, value }: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <>
      <label className="eyebrow">{label}</label>
      <input className={styles.input} value={value} onChange={(event) => onChange(event.target.value)} />
    </>
  );
}
