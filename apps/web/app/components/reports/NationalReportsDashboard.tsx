"use client";

import { useMemo, useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import styles from "./reports.module.css";

type ChartRows = Record<string, string>[];
type ReportSection = {
  charts: Record<string, ChartRows>;
  metrics: Array<{ label: string; value: string }>;
  title: string;
};
type Payload = {
  filters: { bloodTypes: string[]; hospitals: Array<{ id: string; name: string }>; municipalities: string[]; provinces: string[]; statuses: string[] };
  reports: ReportSection[];
};

const empty: Payload = { filters: { bloodTypes: [], hospitals: [], municipalities: [], provinces: [], statuses: [] }, reports: [] };

export function NationalReportsDashboard() {
  const [filters, setFilters] = useState({ bloodType: "", dateFrom: "", dateTo: "", hospital: "", municipality: "", province: "", status: "" });
  const [schedule, setSchedule] = useState("Sem agendamento");
  const version = useSupabaseRealtimeVersion(["blood_requests", "donor_responses", "donors", "hospital_inventory", "hospitals"]);
  const query = useMemo(() => new URLSearchParams(filters).toString(), [filters]);
  const { data, error, loading } = useApiData<Payload>(`/api/admin/national-reports?${query}`, empty, version);
  const allRows = data.reports.flatMap((section) =>
    Object.entries(section.charts).flatMap(([title, rows]) => rows.map((row) => ({ Relatório: section.title, Gráfico: title, ...row })))
  );

  return (
    <section className={styles.printable}>
      <div className={styles.filters}>
        <DateField label="Data inicial" value={filters.dateFrom} onChange={(dateFrom) => setFilters((current) => ({ ...current, dateFrom }))} />
        <DateField label="Data final" value={filters.dateTo} onChange={(dateTo) => setFilters((current) => ({ ...current, dateTo }))} />
        <Select label="Província" value={filters.province} values={data.filters.provinces} onChange={(province) => setFilters((current) => ({ ...current, province }))} />
        <Select label="Município" value={filters.municipality} values={data.filters.municipalities} onChange={(municipality) => setFilters((current) => ({ ...current, municipality }))} />
        <label className={styles.field}>
          <span className="eyebrow">Hospital</span>
          <select value={filters.hospital} onChange={(event) => setFilters((current) => ({ ...current, hospital: event.target.value }))}>
            <option value="">Todos</option>
            {data.filters.hospitals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <Select label="Tipo sanguíneo" value={filters.bloodType} values={data.filters.bloodTypes} onChange={(bloodType) => setFilters((current) => ({ ...current, bloodType }))} />
        <Select label="Estado" value={filters.status} values={data.filters.statuses} onChange={(status) => setFilters((current) => ({ ...current, status }))} />
        <label className={styles.field}>
          <span className="eyebrow">Relatório agendado</span>
          <select value={schedule} onChange={(event) => setSchedule(event.target.value)}>
            {["Sem agendamento", "Diário", "Semanal", "Mensal"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className={styles.actions}>
        <button className={styles.export} onClick={() => exportCsv("relatorios-nacionais.csv", allRows)} type="button">Exportar CSV</button>
        <button className={styles.pdfPreview} onClick={() => exportCsv("relatorios-nacionais-excel.csv", allRows, ";")} type="button">Exportar Excel</button>
        <button className={styles.pdfPreview} onClick={() => window.print()} type="button">Exportar PDF</button>
        <span className="muted">Agendamento configurado: {schedule}</span>
      </div>

      {loading ? <p className="muted">A carregar relatórios nacionais...</p> : null}
      {error ? <p className="muted">Falha nos relatórios: {error}</p> : null}
      {!loading && !error && data.reports.length === 0 ? (
        <p className="muted">Sem dados suficientes para este relatório.</p>
      ) : null}
      {data.reports.map((section) => <ReportSectionView key={section.title} section={section} />)}
    </section>
  );
}

function Select({ label, onChange, value, values }: { label: string; onChange: (value: string) => void; value: string; values: string[] }) {
  return (
    <label className={styles.field}>
      <span className="eyebrow">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}

function DateField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className={styles.field}>
      <span className="eyebrow">{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ReportSectionView({ section }: { section: ReportSection }) {
  return (
    <article className={styles.card}>
      <h2>{section.title}</h2>
      <div className={styles.summary}>
        {section.metrics.map((metric) => (
          <div className={styles.summaryItem} key={metric.label}>
            <span className="muted">{metric.label}</span>
            <h3>{metric.value}</h3>
          </div>
        ))}
      </div>
      <div className={styles.reportCharts}>
        {Object.entries(section.charts).map(([title, rows]) => (
          <ChartCard key={title} rows={rows} title={title} />
        ))}
      </div>
    </article>
  );
}

function ChartCard({ rows, title }: { rows: ChartRows; title: string }) {
  const max = Math.max(...rows.map((row) => Number(Object.values(row)[1] ?? 0)), 1);
  return (
    <section className={styles.chartCard}>
      <div className={styles.headerLine}>
        <strong>{title}</strong>
        <button className={styles.pdfPreview} onClick={() => exportCsv(`${slug(title)}.csv`, rows)} type="button">Exportar CSV</button>
      </div>
      {!rows.length ? <p className="muted">Sem dados suficientes para este relatório.</p> : null}
      {rows.slice(0, 8).map((row) => {
        const [label, raw] = Object.values(row);
        const value = Number(raw ?? 0);
        return (
          <div className={styles.barRow} key={`${title}-${label}`}>
            <span>{label}</span>
            <div className={styles.bar}><span style={{ width: `${Math.max(6, value / max * 100)}%` }} /></div>
            <strong>{raw}</strong>
          </div>
        );
      })}
    </section>
  );
}

function exportCsv(filename: string, rows: Record<string, string>[], separator = ",") {
  const headers = Object.keys(rows[0] ?? { Relatório: "" });
  const csv = [
    headers.join(separator),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll("\"", "\"\"")}"`).join(separator))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slug(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
}
