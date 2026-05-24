"use client";

import type { BloodType } from "@doe-sangue-angola/shared-types";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { OnboardingShell } from "./OnboardingShell";
import styles from "./onboarding.module.css";

const bloodTypes: BloodType[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
const genders = ["Masculino", "Feminino"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const maxBirthDate = eligibleBirthDate();
const minBirthDate = "1900-01-01";
const oldestYear = 1900;
const youngestYear = Number(maxBirthDate.slice(0, 4));

export function DonorOnboarding() {
  const { session } = useAuth();
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
  const [birthParts, setBirthParts] = useState({ day: "", month: "", year: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Preencha os dados reais do dador.");
  const dayCount = daysInMonth(Number(birthParts.year), Number(birthParts.month));

  async function save() {
    if (!session?.user.id) return setMessage("Sessão inválida. Entre novamente.");
    const missing = requiredFields(form);
    if (missing.length) {
      setMessage(`Complete: ${missing.join(", ")}.`);
      return;
    }
    if (!isEligibleAge(form.birthDate)) {
      setMessage("O dador deve ter pelo menos 18 anos e uma data válida.");
      return;
    }
    setSaving(true);
    setMessage("A guardar perfil de dador...");
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
      setMessage("Perfil guardado. A abrir app do dador...");
      router.refresh();
      window.setTimeout(() => router.replace("/mobile"), 350);
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
        <div className={styles.dateGrid}>
          <select className={styles.input} value={birthParts.day} onChange={(event) =>
            updateBirth({ ...birthParts, day: event.target.value }, setBirthParts, setForm)}>
            <option value="">Dia</option>
            {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) =>
              <option key={day} value={day}>{day}</option>
            )}
          </select>
          <select className={styles.input} value={birthParts.month} onChange={(event) =>
            updateBirth({ ...birthParts, month: event.target.value }, setBirthParts, setForm)}>
            <option value="">Mês</option>
            {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
          </select>
          <select className={styles.input} value={birthParts.year} onChange={(event) =>
            updateBirth({ ...birthParts, year: event.target.value }, setBirthParts, setForm)}>
            <option value="">Ano</option>
            {yearOptions().map((year) => <option key={year}>{year}</option>)}
          </select>
        </div>
        <small className="muted">Escolha uma data. Dadores devem ter pelo menos 18 anos.</small>
        <button className="button" disabled={saving} onClick={save} type="button">
          {saving ? "A guardar..." : "Guardar perfil"}
        </button>
        <span className="muted">{message}</span>
      </aside>
    </OnboardingShell>
  );
}

function eligibleBirthDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().slice(0, 10);
}

function isEligibleAge(value: string) {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && value <= maxBirthDate && value >= minBirthDate;
}

function daysInMonth(year: number, month: number) {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function toBirthDate(parts: { day: string; month: string; year: string }) {
  const day = Number(parts.day);
  const month = Number(parts.month);
  const year = Number(parts.year);
  if (!day || !month || !year) return "";
  const maxDay = daysInMonth(year, month);
  if (day > maxDay) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function updateBirth(
  next: { day: string; month: string; year: string },
  setBirthParts: (value: { day: string; month: string; year: string }) => void,
  setForm: Dispatch<SetStateAction<{
    birthDate: string;
    bloodType: BloodType;
    emergencyContactName: string;
    emergencyContactPhone: string;
    gender: string;
    municipality: string;
    phone: string;
    province: string;
  }>>
) {
  const day = Number(next.day);
  const maxDay = daysInMonth(Number(next.year), Number(next.month));
  const normalized = { ...next, day: day > maxDay ? "" : next.day };
  setBirthParts(normalized);
  setForm((current) => ({ ...current, birthDate: toBirthDate(normalized) }));
}

function yearOptions() {
  return Array.from(
    { length: youngestYear - oldestYear + 1 },
    (_, index) => oldestYear + index
  );
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
