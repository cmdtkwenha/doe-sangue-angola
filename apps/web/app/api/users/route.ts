import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../_utils/apiResponse";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");

  if (email) {
    return apiResponse(() => dataProvider.findUserByEmail(email));
  }

  return apiResponse(() => dataProvider.listUsers());
}

export async function POST(request: Request) {
  const body = await readJson<{
    authUserId?: string;
    email: string;
    name: string;
    phone?: string;
    role: "admin" | "hospital" | "donor";
  }>(request);

  return apiResponse(() =>
    dataProvider.createUser({
      authUserId: body.authUserId,
      email: body.email ?? "",
      name: body.name ?? "",
      phone: body.phone,
      role: body.role ?? "donor"
    })
  );
}
