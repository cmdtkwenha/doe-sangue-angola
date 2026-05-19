import { dataProvider } from "@doe-sangue-angola/shared-services";
import type { BloodType, Donor } from "@doe-sangue-angola/shared-types";
import { auditApiAction } from "../_utils/audit";
import { ApiError, apiResponse, readJson } from "../_utils/apiResponse";
import { requireApiSession, requireSameOrigin } from "../_utils/security";
import { assertBloodType, assertString, optionalString } from "../_utils/validation";

type DonorBody = {
  birthDate: string;
  bloodType: BloodType;
  authUserId?: string;
  email?: string;
  fullName: string;
  gender?: string;
  municipality: string;
  phone: string;
  province: string;
  userId: string;
};

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const userId = new URL(request.url).searchParams.get("userId");
    if (userId === "missing") return null;
    if (userId) {
      if (principal.role !== "admin" && principal.authUserId !== userId && principal.profileId !== userId) {
        throw new ApiError(403, "Acesso negado ao perfil do dador.");
      }
      return dataProvider.findDonorByUserId(userId);
    }
    if (principal.role !== "admin") throw new ApiError(403, "Lista restrita ao admin.");
    return dataProvider.listDonors();
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<DonorBody>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const authUserId = body.authUserId || principal.authUserId;
    if (principal.role !== "admin" && authUserId !== principal.authUserId) {
      throw new ApiError(403, "Só pode atualizar o seu perfil de dador.");
    }
    const donor = await dataProvider.upsertDonorProfile({
      authUserId,
      birthDate: optionalString(body.birthDate, 20) ?? "",
      bloodType: assertBloodType(body.bloodType),
      email: optionalString(body.email, 180) ?? principal.email,
      fullName: assertString(body.fullName, "Nome completo", 180),
      gender: optionalString(body.gender, 40),
      municipality: assertString(body.municipality, "Município", 120),
      phone: assertString(body.phone, "Telefone", 40),
      province: assertString(body.province, "Província", 120),
      userId: body.userId || principal.profileId
    }) as Donor;
    await auditApiAction(principal, `Atualizou perfil de dador ${donor.id}.`);
    return donor;
  });
}
