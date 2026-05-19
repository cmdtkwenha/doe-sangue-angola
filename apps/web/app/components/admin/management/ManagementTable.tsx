"use client";

import { useMemo, useState } from "react";
import styles from "./management.module.css";
import { ActionMenu } from "./ActionMenu";
import { EmptyState } from "../../ui/EmptyState";
import { ExportButton } from "./ExportButton";
import { StatusBadge } from "./StatusBadge";

export type ManagementRow = {
  id: string;
  status: string;
  values: Record<string, string>;
  actions: string[];
};

export function ManagementTable({
  columns,
  disableFilters = false,
  exportName,
  rows,
  title
}: {
  columns: string[];
  disableFilters?: boolean;
  exportName: string;
  rows: ManagementRow[];
  title: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [sort, setSort] = useState(columns[0]);
  const [page, setPage] = useState(1);
  const statuses = useMemo(() => [
    "Todos",
    ...Array.from(new Set(rows.map((row) => row.status)))
  ], [rows]);
  const pageSize = 6;
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => disableFilters ? rows : rows
      .filter((row) => status === "Todos" || row.status === status)
      .filter((row) => Object.values(row.values).join(" ").toLowerCase().includes(normalizedQuery))
      .sort((a, b) => (a.values[sort] ?? "").localeCompare(b.values[sort] ?? "")),
  [disableFilters, normalizedQuery, rows, sort, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <strong>{title}</strong>
        <div className={styles.controls}>
          {!disableFilters ? (
            <>
              <input className={styles.input} onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }} placeholder="Pesquisar..." />
              <select className={styles.select} onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }} value={status}>
                {statuses.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select className={styles.select} onChange={(event) => setSort(event.target.value)} value={sort}>
                {columns.map((item) => <option key={item}>{item}</option>)}
              </select>
            </>
          ) : null}
          <ExportButton filename={exportName} rows={filtered.map((row) => row.values)} />
        </div>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          message="Ajuste os filtros ou limpe a pesquisa para ver registos."
          title="Sem resultados"
        />
      ) : (
      <table className={styles.table}>
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}<th>Estado</th><th>Ações</th></tr></thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td data-label={column} key={column}>{row.values[column]}</td>)}
              <td data-label="Estado"><StatusBadge status={row.status} /></td>
              <td data-label="Ações"><ActionMenu actions={row.actions} label={`Ações ${row.id}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
      <div className={styles.pager}>
        <span className="muted">
          {filtered.length} visíveis de {rows.length} registos · Página {safePage} de {totalPages}
        </span>
        <div className={styles.controls}>
          <button className={styles.pageButton} disabled={page === 1} onClick={() => setPage(page - 1)} type="button">Anterior</button>
          <button className={styles.pageButton} disabled={page === totalPages} onClick={() => setPage(page + 1)} type="button">Seguinte</button>
        </div>
      </div>
    </section>
  );
}
