import {
  hospitalRepository
} from "@doe-sangue-angola/shared-services";
import { auditApiAction } from "../_utils/audit";
import { ApiError, apiResponse, readJson } from "../_utils/apiResponse";
import { requireApiSession, requireEntityAccess, requireSameOrigin } from "../_utils/security";
import { assertString } from "../_utils/validation";

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const userId = new URL(request.url).searchParams.get("userId");
    if (userId === "missing") return null;
    if (userId) {
      if (principal.role !== "admin" && principal.profileId !== userId) {
        throw new ApiError(403, "Acesso negado ao hospital.");
      }
      return hospitalRepository.findHospitalByUserId(userId);
    }
    const hospitals = await hospitalRepository.listHospitals();
    return principal.role === "admin" ? hospitals : hospitals.filter((item) => item.verified);
  });
}

export async function PUT(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ hospitalId: string; userId: string }>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = assertString(body.hospitalId, "Hospital");
    const userId = principal.role === "admin"
      ? assertString(body.userId, "Utilizador")
      : principal.profileId;
    const hospital = await hospitalRepository.assignHospitalUser(hospitalId, userId);
    requireEntityAccess({ ...principal, hospitalId }, "hospital", hospital.id);
    await auditApiAction(principal, `Associou utilizador ao hospital ${hospital.name}.`);
    return hospital;
  });
}
