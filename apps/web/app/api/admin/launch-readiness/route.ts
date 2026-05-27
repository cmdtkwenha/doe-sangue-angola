import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";

type ActionBody = { action: "reset" | "seed" };
const testCode = "PILOT-TEST";

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const checks = await Promise.all([
      count(db, "hospitals"),
      count(db, "blood_requests"),
      count(db, "donor_responses"),
      count(db, "notifications"),
      count(db, "profiles", "role", "admin"),
      count(db, "profiles", "role", "hospital"),
      count(db, "profiles", "role", "donor")
    ]);
    return {
      health: [
        item("Supabase ligado", checks[0].ok),
        item("Auth funcional", checks[4].count > 0),
        item("Realtime preparado", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)),
        item("Tabela de pedidos ligada", checks[1].ok),
        item("Respostas de dadores ligadas", checks[2].ok),
        item("Notificações ligadas", checks[3].ok)
      ],
      checklist: [
        item("Hospitais importados", checks[0].count >= 25, `${checks[0].count} hospitais`),
        item("Admin existe", checks[4].count > 0),
        item("Conta hospital de teste pronta", checks[5].count > 0),
        item("Conta dador de teste pronta", checks[6].count > 0),
        item("Criação de pedido pronta", checks[1].ok),
        item("Aceite do dador pronto", checks[2].ok),
        item("Validação PIN pronta", checks[2].ok),
        item("Conclusão pronta", checks[1].ok && checks[2].ok)
      ]
    };
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<ActionBody>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    if (body.action === "reset") {
      await resetPilot(db);
      await auditApiAction(principal, "Reiniciou dados de teste do piloto.");
      return { message: "Dados de teste removidos com segurança." };
    }
    if (body.action !== "seed") throw new ApiError(400, "Ação inválida.");
    const result = await seedPilot(db);
    await auditApiAction(principal, "Criou cenário de teste do piloto.");
    return result;
  });
}

async function seedPilot(db: Awaited<ReturnType<typeof createRouteSupabase>>) {
  const [{ data: hospital }, { data: donor }] = await Promise.all([
    db.from("hospitals").select("id,province,municipality").eq("verified", true).limit(1).maybeSingle(),
    db.from("donors").select("id,user_id,blood_type,province,municipality").limit(1).maybeSingle()
  ]);
  if (!hospital?.id || !donor?.id) throw new ApiError(409, "Crie um hospital e um dador antes do cenário piloto.");
  const { data: existing } = await db
    .from("blood_requests")
    .select("id")
    .like("patient_code", `${testCode}%`)
    .limit(1)
    .maybeSingle();
  const requestId = existing?.id ?? await createRequest(db, hospital, donor.blood_type ?? "O-");
  const { data: response } = await db
    .from("donor_responses")
    .select("id")
    .eq("donor_id", donor.id)
    .eq("blood_request_id", requestId)
    .maybeSingle();
  if (response?.id) return { message: "Cenário piloto já estava pronto.", requestId };
  await db.from("donor_responses").insert({
    accepted_at: new Date().toISOString(),
    blood_request_id: requestId,
    confirmation_pin: "2026",
    donor_id: donor.id,
    eta_minutes: 15,
    hospital_id: hospital.id,
    pin_expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: "accepted"
  });
  return { message: "Cenário piloto criado.", requestId };
}

async function createRequest(db: Awaited<ReturnType<typeof createRouteSupabase>>, hospital: {
  id: string; municipality?: string | null; province?: string | null;
}, bloodType: string) {
  const { data, error } = await db.from("blood_requests").insert({
    blood_type: bloodType,
    hospital_id: hospital.id,
    municipality: hospital.municipality,
    patient_code: `${testCode}-${Date.now()}`,
    province: hospital.province,
    status: "Aberto",
    units: 1,
    units_needed: 1,
    urgency: "Critica"
  }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

async function resetPilot(db: Awaited<ReturnType<typeof createRouteSupabase>>) {
  const { data } = await db.from("blood_requests").select("id").like("patient_code", `${testCode}%`);
  const ids = (data ?? []).map((item) => item.id);
  if (ids.length) await db.from("donor_responses").delete().in("blood_request_id", ids);
  if (ids.length) await db.from("blood_requests").delete().in("id", ids);
}

async function count(db: Awaited<ReturnType<typeof createRouteSupabase>>, table: string, field?: string, value?: string) {
  let query = db.from(table).select("*", { count: "exact", head: true });
  if (field && value) query = query.eq(field, value);
  const { count: total, error } = await query;
  return { count: total ?? 0, ok: !error };
}

function item(label: string, ok: boolean, detail = ok ? "Pronto" : "Requer atenção") {
  return { detail, label, ok };
}
