import {
  authRepository,
  donorRepository
} from "@doe-sangue-angola/shared-services";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { requireAuthUser, requireSameOrigin } from "../../_utils/security";
import { assertRole, assertString, optionalString } from "../../_utils/validation";

type ProfileBody = {
  authUserId: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
};

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<ProfileBody>(request);

  return apiResponse(async () => {
    const user = await requireAuthUser();
    if (body.authUserId !== user.id) {
      throw new ApiError(403, "Perfil não pertence à sessão autenticada.");
    }
    const profile = await authRepository.upsertProfile({
      authUserId: user.id,
      email: user.email ?? assertString(body.email, "Email", 180),
      name: assertString(body.name, "Nome", 180),
      phone: optionalString(body.phone, 40),
      role: assertRole(body.role ?? "donor")
    });

    if (profile.role === "donor") {
      const existing = await donorRepository.findDonorByUserId(user.id);
      if (!existing) {
        await donorRepository.upsertDonorProfile({
          authUserId: body.authUserId ?? "",
          birthDate: "",
          bloodType: "O+",
          email: body.email ?? "",
          fullName: body.name ?? "Dador",
          municipality: "",
          phone: body.phone ?? "",
          province: "",
          userId: user.id
        });
      }
    }

    return profile;
  });
}
