import { bloodTypes } from "@doe-sangue-angola/shared-services";
import styles from "./reports.module.css";

const provinces = ["Todas", "Luanda", "Huambo", "Benguela", "Uíge"];

export function ReportFilters() {
  return (
    <section aria-label="Filtros de relatórios" className={styles.filters}>
      <label className={styles.field}>
        <span className="eyebrow">Data inicial</span>
        <input defaultValue="2026-05-01" type="date" />
      </label>
      <label className={styles.field}>
        <span className="eyebrow">Data final</span>
        <input defaultValue="2026-05-13" type="date" />
      </label>
      <label className={styles.field}>
        <span className="eyebrow">Província</span>
        <select defaultValue="Todas">
          {provinces.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span className="eyebrow">Tipo sanguíneo</span>
        <select defaultValue="Todos">
          <option>Todos</option>
          {bloodTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span className="eyebrow">Estado</span>
        <select defaultValue="Todos">
          {["Todos", "Aberto", "Agendado", "Concluído", "Crítico"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
    </section>
  );
}
