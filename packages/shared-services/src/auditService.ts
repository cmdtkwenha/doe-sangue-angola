import { auditAgent } from "@doe-sangue-angola/agents";
import type { AuditLog } from "@doe-sangue-angola/shared-types";
import { auditLogs } from "./mockStore";

export function listAuditLogs() {
  return auditLogs;
}

export function recordAudit(actor: string, action: string): AuditLog {
  const log = auditAgent(actor, action, auditLogs.length);
  auditLogs.unshift(log);

  return log;
}
