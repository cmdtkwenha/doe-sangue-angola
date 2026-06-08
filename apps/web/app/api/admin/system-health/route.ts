import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

type AuditRow = {
  action: string | null;
  actor_label: string | null;
  created_at: string | null;
  id: string;
};

const failureTerms = ["falh", "erro", "inválid", "inval", "bloquead", "negad"];

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const started = Date.now();
    const dbCheck = await db.from("users").select("id", { count: "exact", head: true });
    const responseMs = Date.now() - started;
    const audit = await db
      .from("audit_logs")
      .select("id,actor_label,action,created_at")
      .order("created_at", { ascending: false })
      .limit(120);

    const allLogs = audit.data ?? [];
    const errors = allLogs.filter((log) => isFailure(log.action ?? ""));

    return {
      checks: [
        status("Base de dados", dbCheck.error ? "Crítico" : "Operacional", dbCheck.error?.message ?? "Consulta validada."),
        status("Autenticação", "Operacional", "Sessão administrativa validada."),
        status("Supabase", dbCheck.error ? "Crítico" : "Operacional", dbCheck.error ? "Ligação com erro." : "Cliente ligado."),
        status("Tempo de resposta", responseMs > 1200 ? "Aviso" : "Operacional", `${responseMs} ms`)
      ],
      errors: errors.slice(0, 10).map(formatError),
      metrics: {
        failedApprovals: countBy(errors, ["aprovação", "aprov", "verificação"]),
        failedPins: countBy(errors, ["pin"]),
        failedRequests: countBy(errors, ["pedido"]),
        latestErrors: errors.length,
        responseMs
      }
    };
  });
}

function status(label: string, state: "Aviso" | "Crítico" | "Operacional", detail: string) {
  return { detail, label, state };
}

function formatError(log: AuditRow) {
  return {
    action: log.action ?? "Erro sem descrição",
    actor: log.actor_label ?? "Sistema",
    id: log.id,
    time: log.created_at ? new Date(log.created_at).toLocaleString("pt-AO") : "Sem data"
  };
}

function isFailure(action: string) {
  const lower = action.toLowerCase();
  return failureTerms.some((term) => lower.includes(term));
}

function countBy(logs: AuditRow[], terms: string[]) {
  return logs.filter((log) => {
    const action = (log.action ?? "").toLowerCase();
    return terms.some((term) => action.includes(term));
  }).length;
}
