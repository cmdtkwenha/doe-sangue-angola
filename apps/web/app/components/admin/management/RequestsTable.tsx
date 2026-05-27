"use client";

import { requestActions } from "@constants/adminActions";
import type { BloodRequest, Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "../../../hooks/useApiData";
import { useRealtimeVersion } from "../../../hooks/useRealtimeVersion";
import { ManagementTable } from "./ManagementTable";

export function RequestsTable() {
  const version = useRealtimeVersion();
  const { data: hospitals } = useApiData<Hospital[]>("/api/hospitals", [], version);
  const { data: requests } = useApiData<BloodRequest[]>("/api/blood-requests", [], version);

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
