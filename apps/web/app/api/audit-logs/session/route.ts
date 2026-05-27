import { apiResponse } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { requireApiSession, requireSameOrigin } from "../../_utils/security";

export async function POST(request: Request) {
  requireSameOrigin(request);
  return apiResponse(async () => {
    const principal = await requireApiSession();
    await auditApiAction(principal, "Login efetuado com sucesso.");
    return { message: "Sessão auditada." };
  });
}
