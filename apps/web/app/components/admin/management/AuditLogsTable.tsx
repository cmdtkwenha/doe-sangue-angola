"use client";

import { useMemo, useState } from "react";
import { useApiData } from "../../../hooks/useApiData";
import { ManagementTable } from "./ManagementTable";
import styles from "./management.module.css";

type AuditLog = {
  action: string;
  actor: string;
  eventType: string;
  id: string;
  status: string;
  time: string;
};

const events = ["", "Login", "Hospital", "Dador", "Pedido", "PIN", "Doação"];

export function AuditLogsTable() {
  const [date, setDate] = useState("");
  const [event, setEvent] = useState("");
  const [user, setUser] = useState("");
  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (event) params.set("event", event);
    if (user.trim()) params.set("user", user.trim());
    const query = params.toString();
    return query ? `/api/audit-logs?${query}` : "/api/audit-logs";
  }, [date, event, user]);
  const { data, error, loading } = useApiData<AuditLog[]>(path, []);

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <strong>Filtros de auditoria</strong>
          <div className={styles.controls}>
            <input className={styles.input} onChange={(item) => setDate(item.target.value)} type="date" value={date} />
            <input
              className={styles.input}
              onChange={(item) => setUser(item.target.value)}
              placeholder="Utilizador"
              value={user}
            />
            <select className={styles.select} onChange={(item) => setEvent(item.target.value)} value={event}>
              <option value="">Todos os eventos</option>
              {events.filter(Boolean).map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>
        {loading ? <p className="muted" style={{ padding: "0 14px 14px" }}>A carregar registos...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}
      </section>

      <ManagementTable
        disableFilters
        title="Logs de Auditoria"
        exportName="auditoria.csv"
        columns={["Hora", "Utilizador", "Tipo", "Ação"]}
        rows={data.map((log) => ({
          id: log.id,
          status: log.status,
          values: {
            Ação: log.action,
            Hora: log.time,
            Tipo: log.eventType,
            Utilizador: log.actor
          },
          actions: ["Ver detalhe"]
        }))}
      />
    </>
  );
}
