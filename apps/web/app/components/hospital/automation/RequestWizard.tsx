"use client";

import {
  bloodTypes,
  validateBloodRequestDraft
} from "@doe-sangue-angola/shared-services";
import type { BloodType, Urgency } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { createRequestAction } from "../../workflow/workflowActions";
import { useCurrentHospital } from "../useCurrentHospital";
import styles from "./hospitalAutomation.module.css";

export function RequestWizard() {
  const [bloodType, setBloodType] = useState<BloodType>("O-");
  const { data: hospital } = useCurrentHospital();
  const [units, setUnits] = useState(4);
  const [urgency, setUrgency] = useState<Urgency>("Critica");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("Pronto para criar pedido.");

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Assistente de Pedido</strong>
        <span className="pill red">Automático</span>
      </div>
      <form className={styles.form} onSubmit={async (event) => {
        event.preventDefault();
        const hospitalId = hospital?.id ?? "";
        const validation = validateBloodRequestDraft({ bloodType, units, urgency, hospitalId });
        if (!validation.valid) {
          setMessage(validation.errors.join(" "));
          return;
        }
        const result = await createRequestAction({
          bloodType,
          hospitalId,
          municipality: hospital?.municipality,
          notes,
          province: hospital?.province,
          units,
          urgency
        });
        setMessage(result.ok ? "Pedido criado e dadores notificados." : result.message ?? "Falha ao criar pedido.");
      }}>
        <select className={styles.select} onChange={(event) => setBloodType(event.target.value as BloodType)} value={bloodType}>
          {bloodTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <input className={styles.input} min={1} onChange={(event) => setUnits(Number(event.target.value))} type="number" value={units} />
        <select className={styles.select} onChange={(event) => setUrgency(event.target.value as Urgency)} value={urgency}>
          {["Desastre", "Critica", "Alta", "Media", "Normal"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <input className={styles.input} onChange={(event) => setNotes(event.target.value)} placeholder="Notas clínicas" value={notes} />
        <button className={styles.button} type="submit">Criar e notificar dadores</button>
      </form>
      <p className="muted">{message}</p>
    </section>
  );
}
