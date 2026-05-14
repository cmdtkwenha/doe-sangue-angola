import { donorActions } from "@constants/adminActions";
import { donors, listDonorVerificationQueue } from "@doe-sangue-angola/shared-services";
import { ManagementTable } from "./ManagementTable";

export function DonorsTable() {
  const verification = new Map(listDonorVerificationQueue().map((item) => [item.id, item.status]));

  return (
    <ManagementTable
      title="Dadores"
      exportName="dadores.csv"
      columns={["Nome", "Tipo", "Província", "Município", "Pontos"]}
      rows={donors.map((donor) => ({
        id: donor.id,
        status: verification.get(donor.id) ?? "Pendente",
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
  );
}
