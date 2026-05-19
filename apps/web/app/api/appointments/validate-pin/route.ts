import { dataProvider } from "@doe-sangue-angola/shared-services";
import type { Appointment, BloodRequest } from "@doe-sangue-angola/shared-types";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { requireApiSession, requireSameOrigin } from "../../_utils/security";
import { assertPin, optionalString } from "../../_utils/validation";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ pin: string; requestId?: string }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const requestId = optionalString(body.requestId, 80);
    if (principal.role === "hospital") {
      if (!requestId) throw new ApiError(400, "Pedido obrigatório para validar PIN.");
      const ownRequests = await dataProvider.listRequestsForHospital(
        principal.hospitalId ?? ""
      ) as BloodRequest[];
      if (!ownRequests.some((item) => item.id === requestId)) {
        throw new ApiError(403, "Acesso negado a este pedido.");
      }
    }
    const appointment = await dataProvider.validatePin(
      assertPin(body.pin),
      requestId
    ) as Appointment;
    await auditApiAction(principal, `Validou PIN do pedido ${body.requestId ?? appointment.id}.`);
    return appointment;
  });
}
