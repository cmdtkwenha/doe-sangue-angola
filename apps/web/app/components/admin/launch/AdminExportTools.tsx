"use client";

import { useApiData } from "@hooks/useApiData";
import { ExportButton } from "../management/ExportButton";
import styles from "../adminCore.module.css";

type ExportRows = Record<string, string>[];
type ExportData = {
  donors: ExportRows;
  hospitals: ExportRows;
  requests: ExportRows;
  responses: ExportRows;
};

export function AdminExportTools() {
  const { data, error, loading } = useApiData<ExportData>("/api/admin/export-data", {
    donors: [],
    hospitals: [],
    requests: [],
    responses: []
  });

  return (
    <article className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Exportações Críticas</strong>
        <span className="pill">{loading ? "A carregar" : "CSV"}</span>
      </div>
      <p className="muted">
        Exporte cópias de apoio antes do piloto ou antes de uma operação de recuperação.
      </p>
      <div className={styles.headerTools}>
        <ExportButton filename="dadores.csv" rows={data.donors} />
        <ExportButton filename="hospitais.csv" rows={data.hospitals} />
        <ExportButton filename="pedidos-sangue.csv" rows={data.requests} />
        <ExportButton filename="respostas-dadores.csv" rows={data.responses} />
      </div>
      {error ? <p className="muted">{error}</p> : null}
    </article>
  );
}
