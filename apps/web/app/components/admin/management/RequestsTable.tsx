"use client";

import { requestActions } from "@constants/adminActions";
import { getDataMode, hospitals as mockHospitals, requests as mockRequests } from "@doe-sangue-angola/shared-services";
import type { BloodRequest, Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "../../../hooks/useApiData";
import { ManagementTable } from "./ManagementTable";

export function RequestsTable() {
  const fallback = getDataMode() === "mock" ? mockHospitals : [];
  const { data: hospitals } = useApiData<Hospital[]>("/api/hospitals", fallback, 0);
  const requestFallback = getDataMode() === "mock" ? mockRequests : [];
  const { data: requests } = useApiData<BloodRequest[]>("/api/blood-requests", requestFallback, 0);

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
