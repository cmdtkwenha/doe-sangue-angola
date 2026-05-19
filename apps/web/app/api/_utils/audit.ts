import { auditRepository, reportError } from "@doe-sangue-angola/shared-services";
import type { ApiPrincipal } from "./security";

export async function auditApiAction(principal: ApiPrincipal, action: string) {
  try {
    await auditRepository.createAuditLog(
      `${principal.name} (${principal.role})`,
      action
    );
  } catch (error) {
    reportError(error, { feature: "api.audit", metadata: { action } });
  }
}
