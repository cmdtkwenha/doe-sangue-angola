"use client";

import { hospitalActions } from "@constants/adminActions";
import { hospitals as mockHospitals, listHospitalVerificationQueue } from "@doe-sangue-angola/shared-services";
import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "../../../hooks/useApiData";
import { ManagementTable } from "./ManagementTable";

export function HospitalsTable() {
  const verification = new Map(listHospitalVerificationQueue().map((item) => [item.id, item.status]));
  const fallback = process.env.NODE_ENV === "development" ? mockHospitals : [];
  const { data: hospitals } = useApiData<Hospital[]>("/api/hospitals", fallback, 0);

  return (
    <ManagementTable
      title="Hospitais e Clínicas"
      exportName="hospitais.csv"
      columns={["Hospital", "Tipo", "Província", "Município", "Licença", "Contacto"]}
      rows={hospitals.map((hospital) => ({
        id: hospital.id,
        status: hospital.verified ? "Verificado" : verification.get(hospital.id) ?? "Pendente",
        values: {
          Hospital: hospital.name,
          Tipo: hospital.type ?? "Hospital",
          Província: hospital.province,
          Município: hospital.municipality,
          Licença: hospital.licenseNumber ?? "",
          Contacto: hospital.contact
        },
        actions: hospitalActions
      }))}
    />
  );
}
