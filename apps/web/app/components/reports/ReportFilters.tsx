"use client";

import { bloodTypes } from "@doe-sangue-angola/shared-services";
import type { ReportFilterState } from "./reportTypes";
import styles from "./reports.module.css";

const statuses = ["", "Aberto", "Dador a Caminho", "PIN Validado", "Doação concluída", "Concluído", "Cancelado"];

export function ReportFilters({
  filters,
  onChange
}: {
  filters: ReportFilterState;
  onChange: (filters: ReportFilterState) => void;
}) {
  function set(key: keyof ReportFilterState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section aria-label="Filtros de relatórios" className={styles.filters}>
      <Field label="Data inicial" type="date" value={filters.dateFrom} onChange={(value) => set("dateFrom", value)} />
      <Field label="Data final" type="date" value={filters.dateTo} onChange={(value) => set("dateTo", value)} />
      <Field label="Província" value={filters.province} onChange={(value) => set("province", value)} />
      <Field label="Município" value={filters.municipality} onChange={(value) => set("municipality", value)} />
      <Field label="Hospital" value={filters.hospital} onChange={(value) => set("hospital", value)} />
      <label className={styles.field}>
        <span className="eyebrow">Tipo sanguíneo</span>
        <select value={filters.bloodType} onChange={(event) => set("bloodType", event.target.value)}>
          <option value="">Todos</option>
          {bloodTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span className="eyebrow">Estado</span>
        <select value={filters.status} onChange={(event) => set("status", event.target.value)}>
          {statuses.map((item) => <option key={item || "all"} value={item}>{item || "Todos"}</option>)}
        </select>
      </label>
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
      <span className="eyebrow">{label}</span>
      <input onChange={(event) => onChange(event.target.value)} type={type} value={value} />
    </label>
  );
}
