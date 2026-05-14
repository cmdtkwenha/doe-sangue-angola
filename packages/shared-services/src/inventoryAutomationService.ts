import type { BloodType } from "@doe-sangue-angola/shared-types";
import { recordAudit } from "./auditService";
import { inventory } from "./mockStore";
import { publishRealtimeEvent } from "./realtimeService";

export type ExpirationAlert = {
  id: string;
  bloodType: BloodType;
  units: number;
  expiresInDays: number;
  status: "Crítico" | "Atenção";
};

const expirationAlerts: ExpirationAlert[] = [
  { id: "exp-o-neg", bloodType: "O-", units: 2, expiresInDays: 1, status: "Crítico" },
  { id: "exp-a-pos", bloodType: "A+", units: 4, expiresInDays: 3, status: "Atenção" }
];

export function updateInventoryAfterDonation(bloodType: BloodType, units = 1) {
  const item = inventory.find((entry) => entry.bloodType === bloodType);
  if (!item) return { ok: false, message: "Tipo sanguíneo não encontrado." };

  item.units += units;
  recordAudit("inventoryAgent", `Atualizou inventário ${bloodType}: +${units} unidade`);
  publishRealtimeEvent("REQUEST_UPDATED", {
    request: {
      id: `inventory-${bloodType}`,
      hospitalId: "h1",
      patientCode: "INVENTARIO",
      bloodType,
      units,
      urgency: "Normal",
      status: "Concluído",
      createdAt: new Date().toISOString()
    }
  });

  return { ok: true, item };
}

export function listExpirationAlerts() {
  return expirationAlerts;
}

export function getInventoryAutomationSummary() {
  return inventory.map((item) => ({
    ...item,
    status: item.units < item.safeMinimum ? "Baixo" : "Adequado"
  }));
}
