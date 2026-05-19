import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ donorId: string; requestId: string }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const donorId = assertString(body.donorId, "Dador");
    requireEntityAccess(principal, "donor", donorId);
    const appointment = await dataProvider.acceptRequest(
      donorId,
      assertString(body.requestId, "Pedido")
    );
    await auditApiAction(principal, `Aceitou pedido de sangue ${body.requestId}.`);
    return appointment;
  });
}
