"use client";

import { bloodTypes } from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import styles from "./reports.module.css";

const provinces = ["Todas", "Luanda", "Huambo", "Benguela", "Uíge"];

export function ReportFilters() {
  const [status, setStatus] = useState("Filtros prontos.");

  return (
    <section aria-label="Filtros de relatórios" className={styles.filters}>
      <label className={styles.field}>
        <span className="eyebrow">Data inicial</span>
        <input defaultValue="2026-05-01" onChange={() => setStatus("Filtro aplicado.")} type="date" />
      </label>
      <label className={styles.field}>
        <span className="eyebrow">Data final</span>
        <input defaultValue="2026-05-13" onChange={() => setStatus("Filtro aplicado.")} type="date" />
      </label>
      <label className={styles.field}>
        <span className="eyebrow">Província</span>
        <select defaultValue="Todas" onChange={() => setStatus("Filtro aplicado.")}>
          {provinces.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span className="eyebrow">Tipo sanguíneo</span>
        <select defaultValue="Todos" onChange={() => setStatus("Filtro aplicado.")}>
          <option>Todos</option>
          {bloodTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span className="eyebrow">Estado</span>
        <select defaultValue="Todos" onChange={() => setStatus("Filtro aplicado.")}>
          {["Todos", "Aberto", "Agendado", "Concluído", "Crítico"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <span className="muted">{status}</span>
    </section>
  );
}
