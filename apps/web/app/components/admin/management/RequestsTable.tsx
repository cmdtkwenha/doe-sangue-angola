"use client";

import { requestActions } from "@constants/adminActions";
import { hospitals as mockHospitals, requests } from "@doe-sangue-angola/shared-services";
import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "../../../hooks/useApiData";
import { ManagementTable } from "./ManagementTable";

export function RequestsTable() {
  const fallback = process.env.NODE_ENV === "development" ? mockHospitals : [];
  const { data: hospitals } = useApiData<Hospital[]>("/api/hospitals", fallback, 0);

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
