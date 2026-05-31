import type { AcceptedDonor } from "./incomingDonorTypes";
import { normalizeDonorResponseStatus } from "../ui/DonorResponseStatusBadge";

export function formatTime(value?: string) {
  if (!value) return "hora pendente";
  return new Date(value).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
}

export function isActiveStatus(status: string) {
  const normalized = normalizeDonorResponseStatus(status);
  return normalized !== "completed" && normalized !== "cancelled";
}

export function splitRows(rows: AcceptedDonor[]) {
  const activeKeys = new Set<string>();
  const activeRows: AcceptedDonor[] = [];
  const historyRows: AcceptedDonor[] = [];
  rows.forEach((row) => {
    const key = `${row.donorId}:${row.bloodRequestId ?? row.responseId}`;
    if (isActiveStatus(row.status) && !activeKeys.has(key)) {
      activeKeys.add(key);
      activeRows.push(row);
      return;
    }
    historyRows.push(row);
  });
  return { activeRows, historyRows };
}
