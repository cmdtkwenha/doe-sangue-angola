import { apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";

type IssueBody = {
  action: string;
  message: string;
  page: string;
  role: "admin" | "hospital" | "donor";
  type: string;
};

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const { data, error } = await db
      .from("support_issues")
      .select("id,role,page,action,type,message,status,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new Error(`support_issues select: ${error.message}`);
    return data ?? [];
  });
}

export async function POST(request: Request) {
  return apiResponse(async () => {
    requireSameOrigin(request);
    const principal = await requireApiSession();
    const body = await readJson<IssueBody>(request);
    const message = body.message?.trim();
    if (!message) throw new Error("Descreva o problema antes de enviar.");

    const db = await createRouteSupabase();
    const { data, error } = await db
      .from("support_issues")
      .insert({
        action: body.action ?? "Não especificada",
        message,
        page: body.page ?? "Página não indicada",
        role: body.role ?? principal.role,
        status: "Aberto",
        type: body.type ?? "Problema operacional",
        user_id: principal.authUserId
      })
      .select("id,status")
      .single();

    if (error) throw new Error(`support_issues insert: ${error.message}`);
    return data;
  });
}
