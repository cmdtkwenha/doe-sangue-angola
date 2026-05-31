"use client";

import { rowsToCsv } from "@utils/csv";
import { useMemo, useState } from "react";
import { useApiData } from "../../../hooks/useApiData";
import { EmptyState } from "../../ui/EmptyState";
import { LoadingSkeleton } from "../../ui/LoadingSkeleton";
import styles from "./adminAnalytics.module.css";

type Row = Record<string, any>;
type Data = { donors: Row[]; hospitals: Row[]; inventory: Row[]; profiles: Row[]; requests: Row[]; responses: Row[] };
type Filters = { bloodType: string; dateFrom: string; dateTo: string; hospital: string; municipality: string; province: string; status: string };

const empty: Data = { donors: [], hospitals: [], inventory: [], profiles: [], requests: [], responses: [] };
const filterKeys: Array<keyof Filters> = ["dateFrom", "dateTo", "province", "municipality", "hospital", "bloodType", "status"];

export function AdminAnalyticsDashboard() {
  const { data, error, loading } = useApiData<Data>("/api/admin/analytics", empty);
  const [filters, setFilters] = useState<Filters>({ bloodType: "", dateFrom: "", dateTo: "", hospital: "", municipality: "", province: "", status: "" });
  const analytics = useMemo(() => compute(data, filters), [data, filters]);

  if (loading) return <LoadingSkeleton label="A carregar analítica nacional" />;
  if (error) return <EmptyState title="Não foi possível carregar analítica" message={error} />;
  if (!hasData(data)) return <EmptyState title="Sem dados analíticos" message="Quando existirem dadores, hospitais e pedidos reais, os indicadores aparecem aqui." />;

  return (
    <section className={styles.stack}>
      <FiltersPanel filters={filters} hospitals={data.hospitals} onChange={setFilters} />
      <div className={styles.actions}>
        <button onClick={() => exportCsv(analytics.exportRows)} type="button">Exportar CSV</button>
        <button onClick={() => window.print()} type="button">Vista para impressão</button>
      </div>
      <MetricGrid metrics={analytics.metrics} />
      <section className={styles.grid}>
        <Chart title="Doações por província" rows={analytics.donationsByProvince} />
        <Chart title="Pedidos por província" rows={analytics.requestsByProvince} />
        <Chart title="Escassez por província" rows={analytics.shortagesByProvince} />
        <Chart title="Dadores ativos por município" rows={analytics.activeDonorsByMunicipality} />
        <Chart title="Tipos sanguíneos mais pedidos" rows={analytics.requestedBloodTypes} />
        <Chart title="Risco de escassez por tipo" rows={analytics.shortageByBloodType} />
        <Chart title="Doações concluídas por tipo" rows={analytics.completedByBloodType} />
        <Chart title="Elegibilidade dos dadores" rows={analytics.eligibilityDistribution} />
      </section>
      <section className={styles.grid}>
        <Table title="Hospitais com mais pedidos" rows={analytics.topHospitals} />
        <Table title="Desempenho hospitalar" rows={analytics.hospitalPerformance} />
        <Table title="Dadores mais ativos" rows={analytics.topDonors} />
        <Table title="Riscos operacionais" rows={analytics.riskRows} />
      </section>
    </section>
  );
}

function FiltersPanel({ filters, hospitals, onChange }: { filters: Filters; hospitals: Row[]; onChange: (filters: Filters) => void }) {
  return (
    <section className={styles.filters}>
      {filterKeys.map((key) => (
        <label key={key}>
          <span>{filterLabel(key)}</span>
          {key === "hospital" ? (
            <select value={filters.hospital} onChange={(event) => onChange({ ...filters, hospital: event.target.value })}>
              <option value="">Todos</option>
              {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
            </select>
          ) : (
            <input onChange={(event) => onChange({ ...filters, [key]: event.target.value })} type={key.includes("date") ? "date" : "text"} value={filters[key]} />
          )}
        </label>
      ))}
    </section>
  );
}

function MetricGrid({ metrics }: { metrics: Array<[string, number]> }) {
  return (
    <section className={styles.metrics}>
      {metrics.map(([label, value]) => (
        <article className={styles.metric} key={label}>
          <small>{label}</small>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  );
}

function Chart({ rows, title }: { rows: Array<[string, number]>; title: string }) {
  const max = Math.max(1, ...rows.map(([, value]) => value));
  return (
    <article className={styles.card}>
      <h2>{title}</h2>
      {rows.length ? rows.map(([label, value]) => (
        <div className={styles.bar} key={label}>
          <span>{label}</span>
          <i><b style={{ width: `${Math.max(5, (value / max) * 100)}%` }} /></i>
          <strong>{value}</strong>
        </div>
      )) : <EmptyState title="Sem dados" message="Não há registos para este filtro." />}
    </article>
  );
}

function Table({ rows, title }: { rows: Record<string, string>[]; title: string }) {
  return (
    <article className={styles.card}>
      <h2>{title}</h2>
      {rows.length ? (
        <div className={styles.table}>
          {rows.map((row, index) => <p key={`${title}-${index}`}>{Object.entries(row).map(([key, value]) => <span key={key}><small>{key}</small><strong>{value}</strong></span>)}</p>)}
        </div>
      ) : <EmptyState title="Sem dados" message="Não há registos para este filtro." />}
    </article>
  );
}

function compute(data: Data, filters: Filters) {
  const requests = data.requests.filter((row) => match(row, filters));
  const requestIds = new Set(requests.map((row) => row.id));
  const responses = data.responses.filter((row) => match(row, filters) && (!requestIds.size || requestIds.has(row.blood_request_id)));
  const donors = data.donors.filter((row) => match(row, filters));
  const hospitals = data.hospitals.filter((row) => match(row, filters));
  const inventory = data.inventory.filter((row) => !filters.hospital || row.hospital_id === filters.hospital);
  const completed = responses.filter((row) => row.status === "completed");
  const cancelled = responses.filter((row) => row.status === "cancelled");
  const open = requests.filter((row) => !["Concluído", "Concluido", "Cancelado"].includes(row.status));
  const critical = requests.filter((row) => ["Critica", "Desastre"].includes(row.urgency));
  const profiles = new Map(data.profiles.map((row) => [row.linked_entity_id, row]));
  const hospitalNames = new Map(data.hospitals.map((row) => [row.id, row.name]));
  const metrics: Array<[string, number]> = [
    ["Total de dadores", donors.length],
    ["Dadores ativos", donors.filter((row) => row.available).length],
    ["Hospitais verificados", hospitals.filter((row) => row.verified || row.verification_status === "verified").length],
    ["Pedidos abertos", open.length],
    ["Pedidos críticos", critical.length],
    ["Doações concluídas", completed.length],
    ["Doações canceladas", cancelled.length]
  ];
  return {
    activeDonorsByMunicipality: top(group(donors.filter((row) => row.available), "municipality")),
    completedByBloodType: top(group(completed.map((row) => requests.find((request) => request.id === row.blood_request_id) ?? row), "blood_type")),
    donationsByProvince: top(group(completed.map((row) => requests.find((request) => request.id === row.blood_request_id) ?? row), "province")),
    eligibilityDistribution: top(group(donors, "eligibility_status")),
    exportRows: exportRows({ cancelled, completed, critical, donors, hospitals, open, requests, responses }),
    hospitalPerformance: hospitalPerformance(requests, responses, hospitalNames),
    metrics,
    requestedBloodTypes: top(sumBy(requests, "blood_type", "units_needed")),
    requestsByProvince: top(group(requests, "province")),
    riskRows: riskRows({ cancelled, open, responses }),
    shortageByBloodType: top(shortages(inventory, "blood_type")),
    shortagesByProvince: top(shortages(inventory.map((row) => ({ ...row, province: hospitalProvince(row.hospital_id, data.hospitals) })), "province")),
    topDonors: topDonors(donors, profiles, responses),
    topHospitals: topHospitals(requests, hospitalNames)
  };
}

function match(row: Row, f: Filters) {
  const date = String(row.created_at ?? row.updated_at ?? "");
  return (!f.dateFrom || date >= f.dateFrom) && (!f.dateTo || date.slice(0, 10) <= f.dateTo)
    && (!f.province || row.province === f.province) && (!f.municipality || row.municipality === f.municipality)
    && (!f.hospital || row.hospital_id === f.hospital || row.id === f.hospital)
    && (!f.bloodType || row.blood_type === f.bloodType) && (!f.status || row.status === f.status);
}

function group(rows: Row[], key: string) {
  const totals = new Map<string, number>();
  rows.forEach((row) => totals.set(String(row[key] || "Sem valor"), (totals.get(String(row[key] || "Sem valor")) ?? 0) + 1));
  return totals;
}

function sumBy(rows: Row[], key: string, valueKey: string) {
  const totals = new Map<string, number>();
  rows.forEach((row) => totals.set(String(row[key] || "Sem valor"), (totals.get(String(row[key] || "Sem valor")) ?? 0) + Number(row[valueKey] ?? 1)));
  return totals;
}

function shortages(rows: Row[], key: string) {
  return group(rows.filter((row) => Number(row.units_available ?? 0) <= Number(row.minimum_threshold ?? row.safe_minimum ?? 0)), key);
}

function top(map: Map<string, number>, limit = 8) {
  return Array.from(map).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function topHospitals(requests: Row[], names: Map<string, string>) {
  return top(group(requests, "hospital_id"), 6).map(([id, total]) => ({ Hospital: names.get(id) ?? id, Pedidos: String(total) }));
}

function hospitalPerformance(requests: Row[], responses: Row[], names: Map<string, string>) {
  return top(group(requests, "hospital_id"), 5).map(([id]) => {
    const hospitalRequests = requests.filter((row) => row.hospital_id === id);
    const hospitalResponses = responses.filter((row) => row.hospital_id === id);
    const completed = hospitalResponses.filter((row) => row.status === "completed").length;
    const eta = average(hospitalResponses.map((row) => Number(row.eta_minutes ?? 0)).filter(Boolean));
    return { Hospital: names.get(id) ?? id, "Taxa fulfilment": pct(completed, hospitalRequests.length), "ETA médio": `${eta} min`, Cancelados: String(hospitalResponses.filter((row) => row.status === "cancelled").length) };
  });
}

function topDonors(donors: Row[], profiles: Map<any, Row>, responses: Row[]) {
  return donors.map((donor) => ({ Donor: profiles.get(donor.id)?.name ?? donor.blood_type ?? donor.id, Doações: String(responses.filter((row) => row.donor_id === donor.id && row.status === "completed").length), Retenção: donor.last_donation_date || donor.last_donation ? "Com histórico" : "Novo", "Resposta média": `${donor.response_speed_minutes ?? 0} min` }))
    .sort((a, b) => Number(b.Doações) - Number(a.Doações)).slice(0, 6);
}

function riskRows({ cancelled, open, responses }: { cancelled: Row[]; open: Row[]; responses: Row[] }) {
  return [
    { Métrica: "Pedidos por cumprir", Valor: String(open.length) },
    { Métrica: "No-show/cancelamentos", Valor: pct(cancelled.length, responses.length) },
    { Métrica: "Tempo médio de resposta", Valor: `${average(responses.map((row) => Number(row.eta_minutes ?? 0)).filter(Boolean))} min` }
  ];
}

function exportRows(data: Record<string, Row[]>) {
  return Object.entries(data).map(([name, rows]) => ({ Indicador: name, Registos: String(rows.length) }));
}

function exportCsv(rows: Record<string, string>[]) {
  const blob = new Blob([rowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "admin-analytics.csv";
  link.click();
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function pct(value: number, total: number) {
  return total ? `${Math.round((value / total) * 100)}%` : "0%";
}

function hospitalProvince(id: string, hospitals: Row[]) {
  return hospitals.find((hospital) => hospital.id === id)?.province ?? "Sem província";
}

function filterLabel(key: keyof Filters) {
  return ({ bloodType: "Tipo sanguíneo", dateFrom: "Desde", dateTo: "Até", hospital: "Hospital", municipality: "Município", province: "Província", status: "Estado" } as Record<keyof Filters, string>)[key];
}

function hasData(data: Data) {
  return data.donors.length || data.hospitals.length || data.requests.length || data.responses.length || data.inventory.length;
}
