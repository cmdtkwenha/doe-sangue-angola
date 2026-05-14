import { hospitalActions } from "@constants/adminActions";
import { hospitals, listHospitalVerificationQueue } from "@doe-sangue-angola/shared-services";
import { ManagementTable } from "./ManagementTable";

export function HospitalsTable() {
  const verification = new Map(listHospitalVerificationQueue().map((item) => [item.id, item.status]));

  return (
    <ManagementTable
      title="Hospitais e Clínicas"
      exportName="hospitais.csv"
      columns={["Hospital", "Província", "Município", "Capacidade", "Contacto"]}
      rows={hospitals.map((hospital) => ({
        id: hospital.id,
        status: verification.get(hospital.id) ?? "Pendente",
        values: {
          Hospital: hospital.name,
          Província: hospital.province,
          Município: hospital.municipality,
          Capacidade: String(hospital.capacity),
          Contacto: hospital.contact
        },
        actions: hospitalActions
      }))}
    />
  );
}
