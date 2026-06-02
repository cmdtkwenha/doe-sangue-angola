"use client";

import { analyticsEvents } from "@doe-sangue-angola/shared-services";
import { useRouter } from "next/navigation";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import styles from "./onboarding.module.css";

const initial = {
  address: "",
  email: "",
  licenseNumber: "",
  municipality: "",
  name: "",
  phone: "",
  province: "",
  responsiblePerson: "",
  type: "Hospital"
};

export function HospitalRegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Preencha os dados reais da instituição.");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted) {
      setMessage("Confirme a responsabilidade clínica antes de continuar.");
      return;
    }
    setSaving(true);
    setMessage("A registar hospital para verificação...");
    const response = await fetch("/api/hospitals/onboarding", {
      body: JSON.stringify({ ...form, mode: "register" }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok || payload?.ok === false) {
      setMessage(payload?.message ?? "Não foi possível registar o hospital.");
      return;
    }
    analyticsEvents.onboardingCompleted("hospital");
    setMessage("Hospital registado com sucesso. Aguarde verificação da Administração Nacional.");
    window.setTimeout(() => router.replace("/hospital"), 900);
  }

  return (
    <form className={styles.summary} onSubmit={submit}>
      <div>
        <div className="eyebrow">Nova instituição</div>
        <h2>Registar novo hospital ou clínica</h2>
      </div>
      <Input label="Nome do hospital/clínica" name="name" setForm={setForm} value={form.name} />
      <label className="eyebrow">Tipo</label>
      <select className={styles.input} onChange={(event) => setForm({ ...form, type: event.target.value })} value={form.type}>
        <option>Hospital</option>
        <option>Clínica</option>
        <option>Centro Médico</option>
        <option>Banco de Sangue</option>
      </select>
      <Input label="Província" name="province" setForm={setForm} value={form.province} />
      <Input label="Município" name="municipality" setForm={setForm} value={form.municipality} />
      <Input label="Morada" name="address" setForm={setForm} value={form.address} />
      <Input label="Telefone" name="phone" setForm={setForm} value={form.phone} />
      <Input label="Email institucional" name="email" required={false} setForm={setForm} value={form.email} />
      <Input label="Número da licença sanitária" name="licenseNumber" setForm={setForm} value={form.licenseNumber} />
      <Input label="Pessoa responsável" name="responsiblePerson" setForm={setForm} value={form.responsiblePerson} />
      <label className={styles.consentBox}>
        <input checked={accepted} onChange={(event) => setAccepted(event.target.checked)} type="checkbox" />
        <span>Confirmo que os dados são reais e que a instituição aguardará verificação da Administração Nacional.</span>
      </label>
      <button className="button" disabled={saving || !accepted} type="submit">
        {saving ? "A registar..." : "Registar hospital"}
      </button>
      <span className="muted" role="status">{message}</span>
    </form>
  );
}

function Input({
  label,
  name,
  required = true,
  setForm,
  value
}: {
  label: string;
  name: keyof typeof initial;
  required?: boolean;
  setForm: Dispatch<SetStateAction<typeof initial>>;
  value: string;
}) {
  return (
    <>
      <label className="eyebrow">{label}</label>
      <input
        className={styles.input}
        onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
        required={required}
        value={value}
      />
    </>
  );
}
