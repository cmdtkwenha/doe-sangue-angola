"use client";

import { rowsToCsv } from "@utils/csv";
import styles from "./reports.module.css";

export function ReportExportButtons({
  filename,
  rows
}: {
  filename: string;
  rows: Record<string, string>[];
}) {
  return (
    <div className={styles.actions}>
      <button className={styles.export} onClick={() => exportCsv(filename, rows)} type="button">
        Exportar CSV
      </button>
      <button className={styles.pdfPreview} type="button">
        Exportar PDF demonstrativo
      </button>
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
