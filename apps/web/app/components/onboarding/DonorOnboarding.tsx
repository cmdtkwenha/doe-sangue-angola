"use client";

import type { BloodType } from "@doe-sangue-angola/shared-types";
import { analyticsEvents } from "@doe-sangue-angola/shared-services";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { DonorBirthDateSelect, isEligibleBirthDate } from "./DonorBirthDateSelect";
import { OnboardingShell } from "./OnboardingShell";
import styles from "./onboarding.module.css";

const bloodTypes: BloodType[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
const genders = ["Masculino", "Feminino"];
const consentVersion = "pilot-v1";

export function DonorOnboarding() {
  const { refreshSession, session } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    birthDate: "",
    bloodType: "O+" as BloodType,
    consentAccepted: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
    gender: "",
    municipality: "",
    phone: "",
    province: "Luanda"
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Preencha os dados reais do dador.");
  const missingFormFields = requiredFields(form);
  const formReady = missingFormFields.length === 0 &&
    isEligibleBirthDate(form.birthDate) &&
    form.consentAccepted;

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
    setMessage("A guardar perfil...");
    try {
      const userId = session.user.authUserId ?? session.user.id;
      const response = await fetch("/api/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          consentVersion,
          email: session.user.email,
          fullName: session.user.name,
          userId
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.message ?? "Não foi possível guardar o perfil.");
      }
      analyticsEvents.onboardingCompleted("donor");
      setMessage("Perfil guardado com sucesso. A abrir a aplicação...");
      void refreshSession();
      router.replace("/mobile");
      window.location.assign("/mobile");
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
        <Field required label="Município" value={form.municipality} onChange={(municipality) => setForm({ ...form, municipality })} />
        <Field required label="Telefone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
        <label className="eyebrow">Género *</label>
        <select className={styles.input} value={form.gender} onChange={(event) =>
          setForm({ ...form, gender: event.target.value })}>
          <option value="">Selecionar género</option>
          {genders.map((gender) => <option key={gender}>{gender}</option>)}
        </select>
        <Field required label="Contacto de emergência" value={form.emergencyContactName} onChange={(emergencyContactName) =>
          setForm({ ...form, emergencyContactName })} />
        <Field required label="Telefone de emergência" value={form.emergencyContactPhone} onChange={(emergencyContactPhone) =>
          setForm({ ...form, emergencyContactPhone })} />
        <label className="eyebrow">Data de nascimento *</label>
        <DonorBirthDateSelect onChange={(birthDate) => setForm({ ...form, birthDate })} />
        <label className={styles.consentBox}>
          <input
            checked={form.consentAccepted}
            onChange={(event) => setForm({ ...form, consentAccepted: event.target.checked })}
            type="checkbox"
          />
          <span>
            Aceito os Termos de Uso, a Política de Privacidade e o Aviso Médico.
            Entendo que os meus dados de perfil, tipo sanguíneo, localização e notificações
            serão usados para compatibilidade e coordenação de doações.
          </span>
        </label>
        {missingFormFields.length ? (
          <small className="muted">Campos em falta: {missingFormFields.join(", ")}.</small>
        ) : null}
        {!form.consentAccepted ? <small className="muted">Consentimento obrigatório para continuar.</small> : null}
        <button className="button" disabled={saving || !formReady} onClick={save} type="button">
          {saving ? "A guardar..." : "Guardar perfil"}
        </button>
        <span className="muted">{message}</span>
      </aside>
    </OnboardingShell>
  );
}

function requiredFields(form: {
  birthDate: string;
  consentAccepted?: boolean;
  gender: string;
  municipality: string;
  phone: string;
  province: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}) {
  const fields = [
    ["província", form.province],
    ["município", form.municipality],
    ["telefone", form.phone],
    ["género", form.gender],
    ["contacto de emergência", form.emergencyContactName],
    ["telefone de emergência", form.emergencyContactPhone],
    ["data de nascimento", form.birthDate]
  ];

  return fields
    .filter(([, value]) => !String(value).trim())
    .map(([label]) => label);
}

function Field({ label, onChange, required, value }: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <>
      <label className="eyebrow">{label}{required ? " *" : ""}</label>
      <input className={styles.input} value={value} onChange={(event) => onChange(event.target.value)} />
    </>
  );
}
