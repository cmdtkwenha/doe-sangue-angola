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

  return (
    <>
      {error ? <p className={styles.error}>Falha ao carregar dadores: {error}</p> : null}
      <ManagementTable
        title="Dadores"
        exportName="dadores.csv"
        columns={["Nome", "Tipo", "Província", "Município", "Pontos"]}
        rows={donors.map((donor) => ({
          id: donor.id,
          status: donor.available ? "Verificado" : "Pendente",
          values: {
            Nome: donor.name,
            Tipo: donor.bloodType,
            Província: donor.province,
            Município: donor.municipality,
            Pontos: String(donor.points)
          },
          actions: donorActions
        }))}
      />
    </>
  );
}
