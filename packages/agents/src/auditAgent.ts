import type { AuditLog } from "@doe-sangue-angola/shared-types";

export function auditAgent(actor: string, action: string, order = 0): AuditLog {
  const times = ["09:41", "09:38", "09:31", "09:18", "09:05"];

  return {
    id: `audit-${order + 1}-${actor.toLowerCase().replaceAll(" ", "-")}`,
    actor,
    action,
    time: times[order] ?? "08:58"
  };
}
