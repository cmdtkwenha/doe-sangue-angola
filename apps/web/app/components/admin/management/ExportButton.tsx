"use client";

import { rowsToCsv } from "@utils/csv";
import styles from "./management.module.css";

export function ExportButton({ filename, rows }: { filename: string; rows: Record<string, string>[] }) {
  return (
    <button
      className={styles.export}
      onClick={() => {
        const csv = rowsToCsv(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      }}
      type="button"
    >
      Exportar CSV
    </button>
  );
}
