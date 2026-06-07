"use client";

import { fraudActions } from "@constants/adminActions";
import { useApiData } from "../../../hooks/useApiData";
import { useSupabaseRealtimeVersion } from "../../../hooks/useSupabaseRealtimeVersion";
import { ManagementTable } from "./ManagementTable";
import styles from "./management.module.css";

type FraudRow = {
  entity: string;
  flags: string[];
  id: string;
  risk: string;
  score: number;
  status: string;
};

export function FraudReviewTable() {
  const version = useSupabaseRealtimeVersion([
    "donors",
    "donor_responses",
    "fraud_reviews",
    "hospitals",
    "users"
  ]);
  const { data, error, loading } = useApiData<FraudRow[]>("/api/admin/fraud", [], version);

  return (
    <>
      {loading ? <p className="muted">A carregar controlos de segurança...</p> : null}
      {error ? <p className={styles.error}>Falha ao carregar fraude: {error}</p> : null}
      <ManagementTable
        title="Revisões de Fraude"
        exportName="fraude.csv"
        columns={["Caso", "Entidade", "Risco", "Score", "Sinais"]}
        rows={data.map((item) => ({
          id: item.id,
          status: item.status,
          values: {
            Caso: item.id,
            Entidade: item.entity,
            Risco: item.risk,
            Score: String(item.score),
            Sinais: item.flags.join(" · ")
          },
          actions: fraudActions
        }))}
      />
    </>
  );
}
