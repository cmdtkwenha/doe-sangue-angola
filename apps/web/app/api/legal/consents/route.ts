import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const { data, error } = await db
      .from("legal_consents")
      .select("id,user_id,role,consent_type,version,page,accepted_at")
      .order("accepted_at", { ascending: false })
      .limit(80);

    if (error) throw new Error(`legal_consents select: ${error.message}`);
    return data ?? [];
  });
}
