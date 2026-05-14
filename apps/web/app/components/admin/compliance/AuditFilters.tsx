import type { ComplianceEvent } from "./complianceData";
import styles from "./compliance.module.css";

export type AuditFilterState = {
  user: string;
  hospital: string;
  province: string;
  date: string;
};

type FilterKey = keyof AuditFilterState;

const unique = (values: string[]) => ["Todos", ...Array.from(new Set(values))];

export function AuditFilters({
  events,
  filters,
  onChange
}: {
  events: ComplianceEvent[];
  filters: AuditFilterState;
  onChange: (key: FilterKey, value: string) => void;
}) {
  const options = {
    user: unique(events.map((event) => event.actor)),
    hospital: unique(events.map((event) => event.hospital)),
    province: unique(events.map((event) => event.province)),
    date: unique(events.map((event) => event.date))
  };

  return (
    <div className={styles.filters} aria-label="Filtros de auditoria">
      <Select label="Utilizador" value={filters.user} values={options.user} onChange={(value) => onChange("user", value)} />
      <Select label="Hospital" value={filters.hospital} values={options.hospital} onChange={(value) => onChange("hospital", value)} />
      <Select label="Província" value={filters.province} values={options.province} onChange={(value) => onChange("province", value)} />
      <Select label="Data" value={filters.date} values={options.date} onChange={(value) => onChange("date", value)} />
    </div>
  );
}

function Select({
  label,
  onChange,
  value,
  values
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  values: string[];
}) {
  return (
    <label className={styles.filter}>
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}
