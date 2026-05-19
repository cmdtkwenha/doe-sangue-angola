import { dataProvider } from "@doe-sangue-angola/shared-services";
import type { AuditLog } from "@doe-sangue-angola/shared-types";
import { apiResponse, readJson } from "../_utils/apiResponse";
import { auditApiAction } from "../_utils/audit";
import { requireApiSession, requireSameOrigin } from "../_utils/security";
import { assertString } from "../_utils/validation";

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    return dataProvider.listAuditLogs();
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ actor: string; action: string }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const log = await dataProvider.createAuditLog(
      assertString(body.actor, "Ator", 120),
      assertString(body.action, "Ação", 300)
    ) as AuditLog;
    await auditApiAction(principal, `Registou auditoria administrativa ${log.id}.`);
    return log;
  });
}
