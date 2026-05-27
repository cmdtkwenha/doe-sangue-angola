"use client";

import { useMemo, useState } from "react";
import {
  datasetLabel,
  type HealthcareDataset,
  type ImportPreview
} from "@doe-sangue-angola/shared-services";
import styles from "./imports.module.css";

const datasets: HealthcareDataset[] = [
  "hospitals",
  "clinics",
  "provinces",
  "municipalities",
  "blood_banks"
];

export function HealthcareImportPage() {
  const [dataset, setDataset] = useState<HealthcareDataset>("hospitals");
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [status, setStatus] = useState("Carregue um CSV para começar.");
  const [busy, setBusy] = useState(false);
  const canImport = Boolean(preview?.validRows && !preview.issues.some((issue) =>
    !issue.message.includes("Duplicado")
  ));
  const columns = useMemo(() => Object.keys(preview?.rows[0] ?? {}).slice(0, 7), [preview]);

  async function onFile(file?: File) {
    if (!file) return;
    const text = await file.text();
    setCsv(text);
    setStatus(`${file.name} carregado. Pré-visualize antes de importar.`);
    setPreview(null);
  }

  async function submit(mode: "preview" | "import") {
    setBusy(true);
    setStatus(mode === "preview" ? "A validar CSV..." : "A importar para a base de dados...");
    try {
      const response = await fetch("/api/imports/healthcare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, dataset, mode })
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.message);
      setPreview(payload.data);
      setStatus(statusMessage(mode, payload.data));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha na importação.");
    } finally {
      setBusy(false);
    }
  }

  async function exportCsv() {
    const response = await fetch(`/api/imports/healthcare?dataset=${dataset}`);
    const payload = await response.json();
    if (!payload.ok) return setStatus(payload.message ?? "Falha ao exportar.");
    downloadCsv(payload.data.filename, payload.data.csv);
  }

  return (
    <section className={styles.grid}>
      <div className={styles.panel}>
        <div>
          <p className="eyebrow">Importação nacional</p>
          <h2>Dados de saúde de Angola</h2>
          <p className="muted">Hospitais, clínicas, províncias, municípios e bancos de sangue.</p>
        </div>
        <label className={styles.field}>
          Tipo de dados
          <select value={dataset} onChange={(event) => setDataset(event.target.value as HealthcareDataset)}>
            {datasets.map((item) => <option key={item} value={item}>{datasetLabel(item)}</option>)}
          </select>
        </label>
        <label className={styles.upload}>
          <input accept=".csv,text/csv" onChange={(event) => onFile(event.target.files?.[0])} type="file" />
          <span>Selecionar ficheiro CSV</span>
        </label>
        <div className={styles.actions}>
          <button disabled={!csv || busy} onClick={() => submit("preview")} type="button">Pré-visualizar</button>
          <button disabled={!canImport || busy} onClick={() => submit("import")} type="button">Importar</button>
          <button disabled={busy} onClick={exportCsv} type="button">Exportar CSV</button>
        </div>
        <p className={styles.status}>{status}</p>
      </div>
      <PreviewTable columns={columns} preview={preview} />
    </section>
  );
}

function PreviewTable({ columns, preview }: { columns: string[]; preview: ImportPreview | null }) {
  if (!preview) return <div className={styles.panel}>Sem pré-visualização ainda.</div>;
  return (
    <div className={styles.panel}>
      <div className={styles.stats}>
        <span>{preview.totalRows} linhas</span>
        <span>{preview.validRows} válidas</span>
        <span>{preview.duplicates} duplicadas</span>
        <span>{preview.issues.length} avisos</span>
      </div>
      {preview.issues.length ? (
        <ul className={styles.errors}>
          {preview.issues.slice(0, 6).map((issue, index) => (
            <li key={`${issue.row}-${index}`}>Linha {issue.row}: {issue.message} {issue.field ?? ""}</li>
          ))}
        </ul>
      ) : null}
      <table className={styles.table}>
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {preview.rows.slice(0, 8).map((row, index) => (
            <tr key={index}>{columns.map((column) => <td key={column}>{String(row[column] ?? "")}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusMessage(mode: string, data: ImportPreview & { imported?: number; skippedDuplicates?: number }) {
  if (mode === "preview") return `${data.validRows} linhas válidas encontradas.`;
  return `${data.imported ?? 0} importadas. ${data.skippedDuplicates ?? 0} duplicadas ignoradas.`;
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
