"use client";

import { bloodTypes } from "@doe-sangue-angola/shared-services";
import type { BloodType, Donor } from "@doe-sangue-angola/shared-types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApiData } from "../../hooks/useApiData";
import { useAuth } from "../auth/useAuth";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import styles from "./donorSettings.module.css";
import { MobileShell } from "./MobileShell";
import { isDonorProfileComplete, useCurrentDonor } from "./useCurrentDonor";

type Preferences = Record<string, boolean | string>;

export function DonorSettingsEditor() {
  const { refreshSession, session } = useAuth();
  const { data: donor, loading } = useCurrentDonor();
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [prefState, setPrefState] = useState<Preferences>(() => defaultPrefs());
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => donorForm(null, session?.user.email ?? ""));
  const { data: preferences, loading: prefsLoading } = useApiData<Preferences>(
    donor?.id ? `/api/donor/preferences?donorId=${donor.id}` : "/api/donor/preferences?donorId=missing",
    defaultPrefs(),
    donor?.id.length ?? 0
  );

  useEffect(() => {
    if (donor?.id) setForm(donorForm(donor, session?.user.email ?? ""));
  }, [donor?.id, session?.user.email]);

  useEffect(() => {
    setPrefState({ ...defaultPrefs(), ...preferences });
  }, [preferences]);

  if (loading) return <MobileShell active="profile"><LoadingSkeleton label="A carregar definições do dador" /></MobileShell>;
  if (!isDonorProfileComplete(donor, session?.user.authUserId ?? session?.user.id)) {
    return (
      <MobileShell active="profile">
        <EmptyState
          action={<Link className="button" href="/mobile/onboarding">Completar perfil</Link>}
          title="Perfil de dador em falta"
          message="Complete o perfil antes de editar definições."
        />
      </MobileShell>
    );
  }

  async function save() {
    if (!donor) return;
    const missing = missingFields(form);
    if (missing.length) {
      setMessage(`Preencha: ${missing.join(", ")}.`);
      return;
    }
    const birthError = birthDateError(form.birthDate);
    if (birthError) {
      setMessage(birthError);
      return;
    }
    setMessage("A guardar dados...");
    setSaving(true);
    try {
      const donorResult = await post("/api/donors", { ...form, consentAccepted: true, consentVersion: donor.consentVersion ?? "pilot-v1" });
      const prefResult = await post("/api/donor/preferences", { donorId: donor.id, preferences: prefState });
      const passResult = password ? await post("/api/auth/password", { password }) : { ok: true };
      setConfirm(false);
      if (!donorResult.ok || !prefResult.ok || !passResult.ok) {
        setMessage(donorResult.message ?? prefResult.message ?? passResult.message ?? "Não foi possível guardar alterações.");
        return;
      }
      setPassword("");
      setMessage("Definições guardadas com sucesso.");
      await refreshSession();
    } catch {
      setMessage("Não foi possível guardar alterações. Verifique a ligação e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MobileShell active="profile">
      <header className={styles.header}>
        <strong>Perfil e Definições</strong>
        <Link className="button secondary" href="/mobile">Voltar</Link>
      </header>
      <section className={styles.panel}>
        <strong>Dados do Dador</strong>
        <div className={styles.grid}>
          <Field label="Nome completo" value={form.fullName} onChange={(fullName) => setForm({ ...form, fullName })} />
          <Field label="Telefone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
          <Select label="Tipo sanguíneo" value={form.bloodType} values={bloodTypes} onChange={(bloodType) => setForm({ ...form, bloodType: bloodType as BloodType })} />
          <Field label="Província" value={form.province} onChange={(province) => setForm({ ...form, province })} />
          <Field label="Município" value={form.municipality} onChange={(municipality) => setForm({ ...form, municipality })} />
          <Select label="Género" value={form.gender} values={["Masculino", "Feminino"]} onChange={(gender) => setForm({ ...form, gender })} />
          <Field label="Data de nascimento" type="date" value={form.birthDate} onChange={(birthDate) => setForm({ ...form, birthDate })} />
          <Field label="Contacto de emergência" value={form.emergencyContactName} onChange={(emergencyContactName) => setForm({ ...form, emergencyContactName })} />
          <Field label="Telefone de emergência" value={form.emergencyContactPhone} onChange={(emergencyContactPhone) => setForm({ ...form, emergencyContactPhone })} />
          <ReadOnly label="Última doação" value={donor.lastDonation || "Sem registo"} />
          <ReadOnly label="Próxima data elegível" value={donor.nextEligibleDonationDate || "A calcular"} />
        </div>
      </section>
      <AccountSection
        email={form.email}
        password={password}
        preferences={prefState}
        prefsLoading={prefsLoading}
        setPreferences={setPrefState}
        setPassword={setPassword}
      />
      <button className={styles.save} disabled={saving} onClick={() => setConfirm(true)} type="button">
        {saving ? "A guardar..." : "Guardar alterações"}
      </button>
      <p className="muted" role="status">{message}</p>
      <ConfirmationModal
        confirmLabel="Confirmar e guardar"
        message="Confirma que os dados introduzidos estão corretos?"
        loading={saving}
        onClose={() => setConfirm(false)}
        onConfirm={() => void save()}
        open={confirm}
        title="Confirmar alterações"
      />
    </MobileShell>
  );
}

function AccountSection({ email, password, preferences, prefsLoading, setPassword, setPreferences }: {
  email: string;
  password: string;
  preferences: Preferences;
  prefsLoading: boolean;
  setPreferences: (value: Preferences) => void;
  setPassword: (value: string) => void;
}) {
  return (
    <section className={styles.panel}>
      <strong>Conta e Notificações</strong>
      <ReadOnly label="Email" value={email} />
      <Field label="Nova palavra-passe" type="password" value={password} onChange={setPassword} />
      {prefsLoading ? <span className="muted">A carregar preferências...</span> : null}
      <div className={styles.toggles}>
        {preferenceLabels.map(([key, label]) => (
          <Toggle
            key={key}
            label={label}
            onChange={(checked) => setPreferences({ ...preferences, [key]: checked })}
            prefs={preferences}
            prefKey={key}
          />
        ))}
      </div>
      <ReadOnly label="Método preferido" value={String(preferences.preferred_method ?? "in-app")} />
      <ReadOnly label="Estado da conta" value="Ativa" />
    </section>
  );
}

const preferenceLabels = [
  ["emergency_request", "Pedidos urgentes"],
  ["reminder", "Lembretes de elegibilidade"],
  ["pin_updates", "Atualizações de PIN"],
  ["completed_donation", "Doação concluída"],
  ["in_app", "In-app"],
  ["email", "Email"]
] as const;

function Toggle({ label, onChange, prefKey, prefs }: { label: string; onChange: (checked: boolean) => void; prefKey: string; prefs: Preferences }) {
  return (
    <label className={styles.toggle}>
      <input
        checked={Boolean(prefs[prefKey])}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

function Field({ label, onChange, type = "text", value }: { label: string; onChange: (value: string) => void; type?: string; value: string }) {
  return <label className={styles.field}><span>{label}</span><input onChange={(event) => onChange(event.target.value)} type={type} value={value} /></label>;
}

function Select({ label, onChange, value, values }: { label: string; onChange: (value: string) => void; value: string; values: readonly string[] }) {
  return <label className={styles.field}><span>{label}</span><select onChange={(event) => onChange(event.target.value)} value={value}>{values.map((item) => <option key={item}>{item}</option>)}</select></label>;
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return <span className={styles.readOnly}><small>{label}</small><strong>{value}</strong></span>;
}

function donorForm(donor: Donor | null, email: string) {
  return {
    birthDate: donor?.birthDate ?? "",
    bloodType: donor?.bloodType ?? "O-" as BloodType,
    email: donor?.email ?? email,
    emergencyContactName: donor?.emergencyContactName ?? "",
    emergencyContactPhone: donor?.emergencyContactPhone ?? "",
    fullName: donor?.name ?? "",
    gender: donor?.gender ?? "Masculino",
    municipality: donor?.municipality ?? "",
    phone: donor?.phone ?? "",
    province: donor?.province ?? ""
  };
}

function defaultPrefs(): Preferences {
  return { completed_donation: true, email: false, emergency_request: true, in_app: true, pin_updates: true, preferred_method: "in-app", reminder: true };
}

function missingFields(form: ReturnType<typeof donorForm>) {
  return Object.entries({ Nome: form.fullName, Telefone: form.phone, Província: form.province, Município: form.municipality, Género: form.gender, "Data de nascimento": form.birthDate })
    .filter(([, value]) => !String(value ?? "").trim()).map(([label]) => label);
}

function birthDateError(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const min = new Date();
  min.setFullYear(min.getFullYear() - 18);
  if (Number.isNaN(date.getTime())) return "Data de nascimento inválida.";
  if (date > min) return "O dador deve ter pelo menos 18 anos.";
  return "";
}

async function post(path: string, body: unknown) {
  const response = await fetch(path, { body: JSON.stringify(body), headers: { "Content-Type": "application/json" }, method: "POST" });
  return await response.json() as { message?: string; ok: boolean };
}
