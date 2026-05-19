import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../_utils/apiResponse";
import { requireApiSession, requireSameOrigin } from "../_utils/security";
import { assertRole, assertString, optionalString } from "../_utils/validation";

export async function GET(request: Request) {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const email = new URL(request.url).searchParams.get("email");

    if (email) return dataProvider.findUserByEmail(email);

    return dataProvider.listUsers();
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{
    authUserId?: string;
    email: string;
    name: string;
    phone?: string;
    role: "admin" | "hospital" | "donor";
  }>(request);

  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    return dataProvider.createUser({
      authUserId: optionalString(body.authUserId, 80),
      email: assertString(body.email, "Email", 180),
      name: assertString(body.name, "Nome", 180),
      phone: optionalString(body.phone, 40),
      role: assertRole(body.role ?? "donor")
    });
  });
}
