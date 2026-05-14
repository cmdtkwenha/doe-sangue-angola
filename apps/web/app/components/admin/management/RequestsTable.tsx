import { requestActions } from "@constants/adminActions";
import { hospitals, requests } from "@doe-sangue-angola/shared-services";
import { ManagementTable } from "./ManagementTable";

export function RequestsTable() {
  return (
    <ManagementTable
      title="Pedidos de Sangue"
      exportName="pedidos.csv"
      columns={["Pedido", "Hospital", "Tipo", "Bolsas", "Urgência"]}
      rows={requests.map((request) => ({
        id: request.id,
        status: request.status,
        values: {
          Pedido: request.patientCode,
          Hospital: hospitals.find((hospital) => hospital.id === request.hospitalId)?.name ?? "Hospital",
          Tipo: request.bloodType,
          Bolsas: String(request.units),
          Urgência: request.urgency
        },
        actions: requestActions
      }))}
    />
  );
}
