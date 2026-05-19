import { authRepository } from "@doe-sangue-angola/shared-services";
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

  return apiResponse(() =>
    authRepository.upsertProfile({
      authUserId: body.authUserId ?? "",
      email: body.email ?? "",
      name: body.name ?? "Utilizador",
      phone: body.phone,
      role: body.role ?? "donor"
    })
  );
}
