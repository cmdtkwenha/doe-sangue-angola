"use client";

import { useMemo, useState } from "react";
import { ActivityTimeline } from "./ActivityTimeline";
import { AuditExportTool } from "./AuditExportTool";
import { AuditFilters, type AuditFilterState } from "./AuditFilters";
import { listComplianceEvents } from "./complianceData";
import styles from "./compliance.module.css";

const initialFilters: AuditFilterState = {
  user: "Todos",
  hospital: "Todos",
  province: "Todos",
  date: "Todos"
};

export function ComplianceAuditPanel() {
  const [filters, setFilters] = useState(initialFilters);
  const events = useMemo(() => listComplianceEvents(), []);
  const filtered = useMemo(() => events
    .filter((event) => filters.user === "Todos" || event.actor === filters.user)
    .filter((event) => filters.hospital === "Todos" || event.hospital === filters.hospital)
    .filter((event) => filters.province === "Todos" || event.province === filters.province)
    .filter((event) => filters.date === "Todos" || event.date === filters.date),
  [events, filters]);

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className="eyebrow">Compliance</p>
          <h2>Auditoria clínica e operacional</h2>
          <p className="muted">
            Trilho operacional para rastrear pedidos, acessos, permissões, PINs e comunicações críticas.
          </p>
        </div>
        <AuditExportTool events={filtered} />
      </div>

      <AuditFilters
        events={events}
        filters={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />

      <div className={styles.summary}>
        <Metric label="Eventos filtrados" value={String(filtered.length)} />
        <Metric label="Risco alto" value={String(filtered.filter((event) => event.risk === "Alto").length)} />
        <Metric label="Hospitais" value={String(new Set(filtered.map((event) => event.hospital)).size)} />
      </div>

      <ActivityTimeline events={filtered} />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
