"use client";

import { donorActions } from "@constants/adminActions";
import type { Donor } from "@doe-sangue-angola/shared-types";
import { useApiData } from "../../../hooks/useApiData";
import { useSupabaseRealtimeVersion } from "../../../hooks/useSupabaseRealtimeVersion";
import { ManagementTable } from "./ManagementTable";
import styles from "./management.module.css";

export function DonorsTable() {
  const version = useSupabaseRealtimeVersion(["donors"]);
  const { data: donors, error } = useApiData<Donor[]>("/api/donors", [], version);
  const reviewCount = donors.filter((donor) => donor.eligibilityStatus === "needs_review").length;

  return (
    <>
      {error ? <p className={styles.error}>Falha ao carregar dadores: {error}</p> : null}
      {reviewCount > 0 ? (
        <p className={styles.error}>{reviewCount} dador(es) precisam de revisão de elegibilidade.</p>
      ) : null}
      <ManagementTable
        title="Dadores"
        exportName="dadores.csv"
        columns={["Nome", "Tipo", "Província", "Município", "Elegibilidade", "Pontos"]}
        rows={donors.map((donor) => ({
          id: donor.id,
          status: eligibilityLabel(donor),
          values: {
            Nome: donor.name,
            Tipo: donor.bloodType,
            Província: donor.province,
            Município: donor.municipality,
            Elegibilidade: eligibilityLabel(donor),
            Pontos: String(donor.points)
          },
          actions: donorActions
        }))}
      />
    </>
  );
}

function eligibilityLabel(donor: Donor) {
  const labels: Record<string, string> = {
    eligible: "Elegível",
    needs_review: "Revisão necessária",
    permanently_deferred: "Diferido permanente",
    temporarily_deferred: "Diferido temporário"
  };
  return labels[donor.eligibilityStatus ?? "eligible"] ?? (donor.available ? "Elegível" : "Pendente");
}
