"use client";

import type { ComplianceEvent } from "./complianceData";
import styles from "./compliance.module.css";

const headers = ["Data", "Hora", "Tipo", "Ator", "Hospital", "Província", "Risco", "Ação"];

export function AuditExportTool({ events }: { events: ComplianceEvent[] }) {
  function exportCsv() {
    const rows = events.map((event) => [
      event.date,
      event.time,
      event.type,
      event.actor,
      event.hospital,
      event.province,
      event.risk,
      event.action
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "auditoria-compliance.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className={styles.export} onClick={exportCsv} type="button">
      Exportar logs
    </button>
  );
}
