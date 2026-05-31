"use client";

import { bloodTypes } from "@doe-sangue-angola/shared-services";
import type { BloodType, Urgency } from "@doe-sangue-angola/shared-types";
import { type FormEvent, useState } from "react";
import styles from "./familyEmergency.module.css";

const urgencies: Urgency[] = ["Critica", "Alta", "Media", "Normal"];

export function FamilyEmergencyForm() {
  const [form, setForm] = useState({
    bloodType: "O-" as BloodType,
    contactName: "",
    contactPhone: "",
    hospitalName: "",
    municipality: "",
    patientName: "",
    province: "Luanda",
    relationship: "",
    unitsNeeded: 2,
    urgency: "Critica" as Urgency
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("O pedido será analisado pelo Admin antes de ser enviado aos dadores.");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const missing = missingFields(form);
    if (missing.length) {
      setMessage(`Preencha: ${missing.join(", ")}.`);
      return;
    }
    setBusy(true);
    const response = await fetch("/api/family-requests", {
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json() as { message?: string; ok: boolean };
    setBusy(false);
    setMessage(payload.ok
      ? "Pedido submetido para revisão. A equipa nacional irá validar antes de notificar dadores."
      : payload.message ?? "Não foi possível submeter o pedido.");
  }

  return (
    <section className={styles.panel}>
      <strong>Pedido familiar de emergência</strong>
      <p className="muted">Use dados reais. Pedidos só são transmitidos após aprovação.</p>
      <form className={styles.form} onSubmit={submit}>
        <Field label="Nome do paciente" value={form.patientName} onChange={(patientName) => setForm({ ...form, patientName })} />
        <Field label="Hospital" value={form.hospitalName} onChange={(hospitalName) => setForm({ ...form, hospitalName })} />
        <Field label="Província" value={form.province} onChange={(province) => setForm({ ...form, province })} />
        <Field label="Município" value={form.municipality} onChange={(municipality) => setForm({ ...form, municipality })} />
        <label className={styles.field}>
          <span>Tipo sanguíneo</span>
          <select value={form.bloodType} onChange={(event) => setForm({ ...form, bloodType: event.target.value as BloodType })}>
            {bloodTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <Field label="Bolsas necessárias" type="number" value={String(form.unitsNeeded)} onChange={(value) => setForm({ ...form, unitsNeeded: Number(value) })} />
        <label className={styles.field}>
          <span>Urgência</span>
          <select value={form.urgency} onChange={(event) => setForm({ ...form, urgency: event.target.value as Urgency })}>
            {urgencies.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <Field label="Nome do contacto" value={form.contactName} onChange={(contactName) => setForm({ ...form, contactName })} />
        <Field label="Telefone" value={form.contactPhone} onChange={(contactPhone) => setForm({ ...form, contactPhone })} />
        <Field label="Relação com o paciente" value={form.relationship} onChange={(relationship) => setForm({ ...form, relationship })} />
        <button className="button" disabled={busy} type="submit">
          {busy ? "A submeter..." : "Submeter para revisão"}
        </button>
      </form>
      <p className="muted" role="status">{message}</p>
    </section>
  );
}

function Field({ label, onChange, type = "text", value }: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input min={type === "number" ? 1 : undefined} onChange={(event) => onChange(event.target.value)} type={type} value={value} />
    </label>
  );
}

function missingFields(form: Record<string, unknown>) {
  const labels: Record<string, string> = {
    contactName: "contacto",
    contactPhone: "telefone",
    hospitalName: "hospital",
    municipality: "município",
    patientName: "paciente",
    province: "província",
    relationship: "relação"
  };
  return Object.entries(labels).filter(([key]) => !String(form[key] ?? "").trim()).map(([, label]) => label);
}
