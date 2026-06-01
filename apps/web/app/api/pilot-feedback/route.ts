import { auditApiAction } from "../_utils/audit";
import { ApiError, apiResponse, readJson } from "../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../_utils/security";
import { optionalString, assertString } from "../_utils/validation";

type Body = {
  contact?: string;
  description?: string;
  issueType?: string;
  page?: string;
  severity?: string;
  status?: string;
  feedbackId?: string;
};

const issueTypes = ["bug", "login_problem", "request_problem", "pin_problem", "notification_problem", "ui_confusion", "other"];
const severities = ["low", "medium", "high", "critical"];
const statuses = ["open", "in_progress", "resolved"];

export async function GET(request: Request) {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const params = new URL(request.url).searchParams;
    const db = await createRouteSupabase();
    let query = db.from("pilot_feedback").select("*").order("created_at", { ascending: false }).limit(200);
    if (params.get("severity")) query = query.eq("severity", params.get("severity")!);
    if (params.get("status")) query = query.eq("status", params.get("status")!);
    const { data, error } = await query;
    if (error) throw new Error(`pilot_feedback select: ${error.message}`);
    return data ?? [];
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<Body>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const db = await createRouteSupabase();
    const description = assertString(body.description, "Descrição", 1000);
    const { data, error } = await db.from("pilot_feedback").insert({
      contact: optionalString(body.contact, 180),
      description,
      issue_type: normalize(body.issueType, issueTypes, "Tipo de problema inválido."),
      page: assertString(body.page ?? "Não indicado", "Página", 180),
      role: principal.role,
      severity: normalize(body.severity, severities, "Gravidade inválida."),
      status: "open",
      user_id: principal.authUserId
    }).select("id,status").single();
    if (error) throw new Error(`pilot_feedback insert: ${error.message}`);
    await auditApiAction(principal, `Enviou feedback piloto ${data.id}.`);
    return data;
  });
}

export async function PATCH(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<Body>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const feedbackId = assertString(body.feedbackId, "Feedback");
    const status = normalize(body.status, statuses, "Estado inválido.");
    const { data, error } = await db.from("pilot_feedback")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", feedbackId)
      .select("id,status")
      .maybeSingle();
    if (error) throw new Error(`pilot_feedback update: ${error.message}`);
    if (!data) throw new ApiError(404, "Feedback não encontrado.");
    await auditApiAction(principal, `Atualizou feedback piloto ${feedbackId} para ${status}.`);
    return data;
  });
}

function normalize(value: unknown, allowed: string[], message: string) {
  if (typeof value !== "string" || !allowed.includes(value)) throw new ApiError(400, message);
  return value;
}
