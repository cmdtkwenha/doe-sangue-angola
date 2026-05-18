"use client";

import { rowsToCsv } from "@utils/csv";
import { useState } from "react";
import styles from "./reports.module.css";

export function ReportExportButtons({
  filename,
  rows
}: {
  filename: string;
  rows: Record<string, string>[];
}) {
  const [message, setMessage] = useState("");

  return (
    <div className={styles.actions}>
      <button className={styles.export} onClick={() => {
        exportCsv(filename, rows);
        setMessage("CSV exportado.");
      }} type="button">
        Exportar CSV
      </button>
      <button className={styles.pdfPreview} onClick={() => setMessage("PDF demonstrativo preparado em modo mock.")} type="button">
        Exportar PDF demonstrativo
      </button>
      {message ? <span className="muted">{message}</span> : null}
    </div>
  );
}

function exportCsv(filename: string, rows: Record<string, string>[]) {
  const blob = new Blob([rowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
