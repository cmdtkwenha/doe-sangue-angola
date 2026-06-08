import { apiResponse, readJson } from "../_utils/apiResponse";
import { auditApiAction } from "../_utils/audit";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../_utils/security";
import { assertString } from "../_utils/validation";

type AuditLogRow = {
  action: string | null;
  actor_label: string | null;
  created_at: string | null;
  id: string;
};

export async function GET(request: Request) {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const params = new URL(request.url).searchParams;
    const db = await createRouteSupabase();
    let query = db
      .from("audit_logs")
      .select("id,actor_label,action,created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    const date = params.get("date");
    if (date) {
      query = query.gte("created_at", `${date}T00:00:00.000Z`)
        .lte("created_at", `${date}T23:59:59.999Z`);
    }

    const user = params.get("user")?.trim();
    if (user) query = query.ilike("actor_label", `%${user}%`);

    const event = params.get("event")?.trim();
    if (event) query = query.ilike("action", `%${event}%`);

    const { data, error } = await query;
    if (error) throw new Error(`audit_logs select: ${error.message}`);
    return (data ?? []).map(formatAuditLog);
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ actor: string; action: string }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const actor = assertString(body.actor, "Ator", 120);
    const action = assertString(body.action, "Ação", 300);
    const { data: log, error } = await db
      .from("audit_logs")
      .insert({ actor_label: actor, action })
      .select("id,actor_label,action,created_at")
      .single();
    if (error) throw new Error(`audit_logs insert: ${error.message}`);
    await auditApiAction(principal, `Registou auditoria administrativa ${log.id}.`);
    return formatAuditLog(log);
  });
}

function formatAuditLog(log: AuditLogRow) {
  const date = log.created_at ? new Date(log.created_at) : null;
  return {
    action: log.action ?? "Evento sem descrição",
    actor: log.actor_label ?? "Sistema",
    createdAt: log.created_at,
    eventType: classifyEvent(log.action ?? ""),
    id: log.id,
    status: "Registado",
    time: date ? date.toLocaleString("pt-AO") : "Sem data"
  };
}

function classifyEvent(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("login")) return "Login";
  if (lower.includes("hospital")) return "Hospital";
  if (lower.includes("dador")) return "Dador";
  if (lower.includes("pedido")) return "Pedido de sangue";
  if (lower.includes("pin")) return "PIN";
  if (lower.includes("doação") || lower.includes("doacao")) return "Doação";
  return "Operação";
}
