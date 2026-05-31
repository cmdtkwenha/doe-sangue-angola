"use client";

import type { NationalOperationsData } from "./nationalTypes";
import styles from "./national.module.css";

export function NationalReportExports({ data }: { data: NationalOperationsData }) {
  const rows = [
    ...data.metrics.map((item) => ({ secção: "Métrica", nome: item.label, valor: item.value })),
    ...data.bloodTypes.map((item) => ({ secção: "Sangue", nome: item.bloodType, valor: `${item.units}/${item.safeMinimum}` })),
    ...data.rankings.map((item) => ({ secção: "Província", nome: item.province, valor: `${item.donations} doações` }))
  ];
  return (
    <div className={styles.exports} aria-label="Exportar relatórios nacionais">
      <button onClick={() => exportRows("centro-nacional.csv", rows, ",")} type="button">CSV</button>
      <button onClick={() => exportRows("centro-nacional.xls", rows, "\t")} type="button">Excel</button>
      <button onClick={() => window.print()} type="button">PDF</button>
    </div>
  );
}

function exportRows(filename: string, rows: Record<string, string>[], separator: string) {
  const headers = Object.keys(rows[0] ?? { secção: "", nome: "", valor: "" });
  const body = [
    headers.join(separator),
    ...rows.map((row) => headers.map((header) => clean(row[header], separator)).join(separator))
  ].join("\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function clean(value: string, separator: string) {
  return `"${String(value ?? "").replaceAll("\"", "'").replaceAll(separator, " ")}"`;
}
