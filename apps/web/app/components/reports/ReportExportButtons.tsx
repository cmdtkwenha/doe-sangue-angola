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
      <button className={styles.pdfPreview} onClick={() => {
        exportCsv(filename.replace(".csv", "-excel.csv"), rows, ";");
        setMessage("CSV compatível com Excel exportado.");
      }} type="button">
        Exportar Excel CSV
      </button>
      <button className={styles.pdfPreview} onClick={() => {
        window.print();
        setMessage("Vista imprimível preparada.");
      }} type="button">
        PDF / Imprimir
      </button>
      {message ? <span className="muted">{message}</span> : null}
    </div>
  );
}

function exportCsv(filename: string, rows: Record<string, string>[], separator = ",") {
  const csv = separator === "," ? rowsToCsv(rows) : excelCsv(rows, separator);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function excelCsv(rows: Record<string, string>[], separator: string) {
  const headers = Object.keys(rows[0] ?? {});
  return [
    headers.join(separator),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll("\"", "'")}"`).join(separator))
  ].join("\n");
}
