"use client";

import type { BloodType } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { OnboardingShell } from "./OnboardingShell";
import styles from "./onboarding.module.css";

const bloodTypes: BloodType[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export function DonorOnboarding() {
  const { session } = useAuth();
  const [form, setForm] = useState({
    birthDate: "",
    bloodType: "O+" as BloodType,
    gender: "",
    municipality: "",
    phone: "",
    province: "Luanda"
  });
  const [message, setMessage] = useState("Preencha os dados reais do dador.");

  async function save() {
    if (!session?.user.id) return setMessage("Sessão inválida. Entre novamente.");
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
    setMessage(response.ok ? "Perfil de dador guardado no Supabase." : "Não foi possível guardar o perfil.");
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
        <Field label="Género" value={form.gender} onChange={(gender) => setForm({ ...form, gender })} />
        <label className="eyebrow">Data de nascimento</label>
        <input className={styles.input} type="date" value={form.birthDate} onChange={(event) =>
          setForm({ ...form, birthDate: event.target.value })} />
        <button className="button" onClick={save} type="button">Guardar perfil</button>
        <span className="muted">{message}</span>
      </aside>
    </OnboardingShell>
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
