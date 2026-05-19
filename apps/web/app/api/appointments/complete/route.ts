import { dataProvider } from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

type CompleteBody = {
  donorId: string;
  requestId: string;
};

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<CompleteBody>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const requestId = assertString(body.requestId, "Pedido");
    const donorId = assertString(body.donorId, "Dador");
    const requests = await dataProvider.listRequests() as BloodRequest[];
    const requestRecord = requests.find((item) => item.id === requestId);
    if (!requestRecord) throw new ApiError(404, "Pedido não encontrado.");
    requireEntityAccess(principal, "hospital", requestRecord.hospitalId);
    const completed = await dataProvider.completeRequest(donorId, requestId);
    await auditApiAction(principal, `Concluiu doação do pedido ${requestId}.`);
    return completed;
  });
}
