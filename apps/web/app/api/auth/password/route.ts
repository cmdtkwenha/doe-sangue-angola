import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ password: string }>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const password = assertString(body.password, "Nova palavra-passe", 120);
    if (password.length < 8) throw new ApiError(400, "A palavra-passe deve ter pelo menos 8 caracteres.");
    const db = await createRouteSupabase();
    const { error } = await db.auth.updateUser({ password });
    if (error) throw new Error(`auth update password: ${error.message}`);
    await auditApiAction(principal, "Alterou a palavra-passe da conta.");
    return { updated: true };
  });
}
