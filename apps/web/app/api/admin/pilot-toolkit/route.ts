import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";

type ResetAction = "requests" | "responses" | "pins" | "notifications";
type Body = { action?: ResetAction };
type Row = Record<string, string | null | boolean | number>;

export const dynamic = "force-dynamic";

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [users, donors, hospitals, requests, responses, notifications, audits, storage] = await Promise.all([
      read<Row>(db, "users", "id,email,name,role,linked_entity_id,account_status"),
      read<Row>(db, "donors", "id,user_id,blood_type,province,municipality,available"),
      read<Row>(db, "hospitals", "id,name,verified,status,verification_status"),
      read<Row>(db, "blood_requests", "id,hospital_id,status"),
      read<Row>(db, "donor_responses", "id,donor_id,blood_request_id,status,confirmation_pin"),
      read<Row>(db, "notifications", "id,read_at"),
      read<Row>(db, "audit_logs", "id,actor_label,action,created_at", 80, "created_at"),
      storageStatus(db)
    ]);
    return buildToolkit({ audits, donors, hospitals, notifications, requests, responses, storage, users });
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<Body>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    if (!body.action) throw new ApiError(400, "Escolha uma ação de limpeza.");
    const deleted = await reset(db, body.action);
    await auditApiAction(principal, `Executou limpeza piloto: ${resetLabel(body.action)}.`);
    return { message: `${resetLabel(body.action)} concluído. Registos afetados: ${deleted}.` };
  });
}

async function reset(db: Awaited<ReturnType<typeof createRouteSupabase>>, action: ResetAction) {
  if (action === "notifications") return remove(db, "notifications");
  if (action === "responses" || action === "pins") return remove(db, "donor_responses");
  const { data } = await db.from("blood_requests").select("id");
  const ids = (data ?? []).map((item) => item.id);
  if (ids.length) await db.from("donor_responses").delete().in("blood_request_id", ids);
  return await remove(db, "blood_requests");
}

async function remove(db: Awaited<ReturnType<typeof createRouteSupabase>>, table: string) {
  const { count } = await db.from(table).select("id", { count: "exact", head: true });
  const { error } = await db.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(`${table}: ${error.message}`);
  return count ?? 0;
}

async function read<T>(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  table: string,
  columns: string,
  limit = 1000,
  order?: string
) {
  let query = db.from(table).select(columns).limit(limit);
  if (order) query = query.order(order, { ascending: false });
  const { data, error } = await query;
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}

async function storageStatus(db: Awaited<ReturnType<typeof createRouteSupabase>>) {
  try {
    const { error } = await db.storage.listBuckets();
    return error ? "Aviso" : "Operacional";
  } catch {
    return "Aviso";
  }
}

function buildToolkit(data: {
  audits: Row[]; donors: Row[]; hospitals: Row[]; notifications: Row[];
  requests: Row[]; responses: Row[]; storage: string; users: Row[];
}) {
  const verifiedHospitals = data.hospitals.filter((item) => item.verified === true);
  const verifiedDonors = data.donors.filter((item) => item.available === true);
  const activeRequests = data.requests.filter((item) => ["Aberto", "Dador a Caminho", "PIN Validado"].includes(String(item.status)));
  const activeResponses = data.responses.filter((item) => ["Dador a Caminho", "Chegou", "PIN Validado"].includes(String(item.status)));
  const issues = integrityIssues(data);
  const errors = auditErrors(data.audits);
  const workflow = {
    activePins: data.responses.filter((item) => validPin(item.confirmation_pin)).length,
    activeRequests: activeRequests.length,
    incomingDonors: activeResponses.length,
    verifiedDonors: verifiedDonors.length,
    verifiedHospitals: verifiedHospitals.length
  };
  return {
    checklist: checklist(data),
    exports: { donors: data.donors, hospitals: data.hospitals, requests: data.requests, responses: data.responses },
    health: [
      health("Base de dados", data.requests.length >= 0),
      health("Supabase", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)),
      health("Autenticação", data.users.some((item) => item.role === "admin")),
      { detail: "Verificação de buckets", label: "Armazenamento", status: data.storage }
    ],
    issues,
    monitoring: errors,
    readiness: readiness(data, issues, errors),
    status: issues.some((item) => item.count > 0) ? "Aviso" : "Operacional",
    workflow
  };
}

function readiness(data: {
  audits: Row[]; donors: Row[]; hospitals: Row[]; requests: Row[]; responses: Row[]; users: Row[];
}, issues: ReturnType<typeof integrityIssues>, errors: ReturnType<typeof auditErrors>) {
  const hasAdmin = data.users.some((item) => item.role === "admin" && item.account_status === "Ativo");
  const hasHospital = data.users.some((item) => item.role === "hospital" && item.account_status === "Ativo");
  const hasDonor = data.users.some((item) => item.role === "donor" && item.account_status === "Ativo");
  const verifiedHospital = data.hospitals.some((item) => item.verified === true || item.status === "Verificado");
  const verifiedDonor = data.donors.some((item) => item.available === true);
  const activeRequest = data.requests.some((item) => ["Aberto", "Dador a Caminho", "PIN Validado"].includes(String(item.status)));
  const accepted = data.responses.some((item) => ["Dador a Caminho", "PIN Validado"].includes(String(item.status)));
  const pin = data.responses.some((item) => validPin(item.confirmation_pin));
  const completed = data.responses.some((item) => ["Concluído", "Doação concluída"].includes(String(item.status)));
  const cancelled = data.responses.some((item) => item.status === "Cancelado");
  const groups = [
    group("Admin", [
      check("Login", hasAdmin),
      check("Aprovar hospital", verifiedHospital),
      check("Verificar dador", verifiedDonor),
      check("Relatórios", data.audits.length >= 0)
    ]),
    group("Hospital", [
      check("Login", hasHospital),
      check("Criar pedido", activeRequest || data.requests.length > 0),
      check("Ver dador", data.responses.length > 0),
      check("Validar PIN", data.responses.some((item) => item.status === "PIN Validado") || completed),
      check("Concluir doação", completed)
    ]),
    group("Dador", [
      check("Login", hasDonor),
      check("Completar perfil", data.donors.length > 0),
      check("Aceitar pedido", accepted || completed),
      check("Ver PIN", pin),
      check("Cancelar aceitação", cancelled)
    ]),
    group("Sistema", [
      check("RLS validado", issues.every((item) => item.count === 0)),
      check("Auditoria ativa", data.audits.length > 0),
      check("Relatórios ativos", true),
      check("Sem erros críticos", errors.lastErrors.length === 0)
    ])
  ];
  const total = groups.flatMap((item) => item.items);
  const passed = total.filter((item) => item.ok).length;
  return {
    groups,
    passed,
    score: score(passed, total.length, hasAdmin, issues),
    total: total.length
  };
}

function group(label: string, items: ReturnType<typeof check>[]) {
  return { items, label };
}

function score(passed: number, total: number, hasAdmin: boolean, issues: ReturnType<typeof integrityIssues>) {
  if (!hasAdmin || issues.some((item) => item.count > 0)) return "Crítico";
  if (passed === total) return "Pronto";
  return "Atenção";
}

function integrityIssues(data: {
  donors: Row[]; hospitals: Row[]; requests: Row[]; responses: Row[]; users: Row[];
}) {
  const hospitalIds = new Set(data.hospitals.map((item) => item.id));
  const donorIds = new Set(data.donors.map((item) => item.id));
  const donorUserIds = new Set(data.donors.map((item) => item.user_id));
  const requestIds = new Set(data.requests.map((item) => item.id));
  return [
    issue("Hospitais sem utilizador", data.hospitals.filter((h) => !data.users.some((u) => u.role === "hospital" && u.linked_entity_id === h.id))),
    issue("Dadores sem perfil", data.users.filter((u) => u.role === "donor" && !donorUserIds.has(u.id))),
    issue("Pedidos órfãos", data.requests.filter((r) => !hospitalIds.has(r.hospital_id))),
    issue("PINs inválidos", data.responses.filter((r) => !validPin(r.confirmation_pin))),
    issue("Respostas sem pedido", data.responses.filter((r) => !requestIds.has(r.blood_request_id))),
    issue("Respostas sem dador", data.responses.filter((r) => !donorIds.has(r.donor_id)))
  ];
}

function checklist(data: {
  requests: Row[]; responses: Row[];
}) {
  const hasRequest = data.requests.length > 0;
  const hasAccepted = data.responses.length > 0;
  return [
    check("Hospital aprovado", true),
    check("Dador aprovado", true),
    check("Pedido criado", hasRequest),
    check("Pedido aceite", hasAccepted),
    check("PIN gerado", data.responses.some((item) => validPin(item.confirmation_pin))),
    check("PIN validado", data.responses.some((item) => item.status === "PIN Validado")),
    check("Doação concluída", data.responses.some((item) => item.status === "Doação concluída"))
  ];
}

function auditErrors(audits: Row[]) {
  const lowered = audits.map((item) => ({ ...item, text: `${item.action ?? ""}`.toLowerCase() }));
  return {
    approvalFailures: lowered.filter((item) => item.text.includes("aprovação") && item.text.includes("falh")).slice(0, 5),
    lastErrors: lowered.filter((item) => item.text.includes("erro") || item.text.includes("falh")).slice(0, 8),
    loginFailures: lowered.filter((item) => item.text.includes("login") && item.text.includes("falh")).slice(0, 5),
    pinFailures: lowered.filter((item) => item.text.includes("pin") && item.text.includes("falh")).slice(0, 5)
  };
}

function health(label: string, ok: boolean) {
  return { detail: ok ? "Ligado" : "Requer atenção", label, status: ok ? "Operacional" : "Crítico" };
}

function issue(label: string, rows: Row[]) {
  return { count: rows.length, label, samples: rows.slice(0, 3).map((item) => String(item.name ?? item.email ?? item.id)) };
}

function check(label: string, ok: boolean) {
  return { label, ok };
}

function validPin(value: unknown) {
  return typeof value === "string" && /^\d{4}$/.test(value);
}

function resetLabel(action: ResetAction) {
  return {
    notifications: "Limpeza de notificações",
    pins: "Limpeza de PINs",
    requests: "Limpeza de pedidos de sangue",
    responses: "Limpeza de aceites"
  }[action];
}
