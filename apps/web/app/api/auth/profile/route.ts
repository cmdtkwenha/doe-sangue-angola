import {
  authRepository,
  donorRepository
} from "@doe-sangue-angola/shared-services";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import { apiResponse, readJson } from "../../_utils/apiResponse";

type ProfileBody = {
  authUserId: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
};

export async function POST(request: Request) {
  const body = await readJson<ProfileBody>(request);

  return apiResponse(async () => {
    const profile = await authRepository.upsertProfile({
      authUserId: body.authUserId ?? "",
      email: body.email ?? "",
      name: body.name ?? "Utilizador",
      phone: body.phone,
      role: body.role ?? "donor"
    });

    if (profile.role === "donor") {
      const existing = await donorRepository.findDonorByUserId(profile.id);
      if (!existing) {
        await donorRepository.upsertDonorProfile({
          birthDate: "",
          bloodType: "O+",
          municipality: "",
          phone: body.phone ?? "",
          province: "",
          userId: profile.id
        });
      }
    }

    return profile;
  });
}
