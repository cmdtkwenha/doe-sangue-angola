"use client";

import { getFamilyEmergency } from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import styles from "./familyEmergency.module.css";

const labels = [
  ["Tipo sanguíneo", "bloodType"],
  ["Hospital", "hospitalLocation"],
  ["Unidades", "units"],
  ["Urgência", "urgencyTime"],
  ["Relação", "relationship"],
  ["Telefone", "phone"]
] as const;

export function FamilyEmergencyForm() {
  const emergency = getFamilyEmergency();
  const [message, setMessage] = useState("Pronto para criar pedido familiar.");

  return (
    <section className={styles.panel}>
      <strong>Pedido familiar de emergência</strong>
      <p className="muted">Fluxo demonstrativo verificado pelo agente familiar.</p>
      <div aria-label="Resumo do pedido familiar" className={styles.form} role="group">
        {labels.map(([label, key]) => (
          <label className={styles.field} key={key}>
            <span>{label}</span>
            <strong>{String(emergency[key])}</strong>
          </label>
        ))}
      </div>
      <button
        aria-label="Criar pedido familiar de emergência verificado"
        className="button"
        onClick={() => setMessage("Pedido familiar criado e pronto para partilha.")}
        style={{ width: "100%", marginTop: 12 }}
        type="button"
      >
        Criar pedido verificado
      </button>
      <p className="muted" role="status">{message}</p>
    </section>
  );
}
