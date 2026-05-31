import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

type StaffBody = {
  email?: string;
  name?: string;
  role?: string;
  staffId?: string;
  status?: string;
};

const roles = ["gestor", "operador", "observador"];
const statuses = ["active", "inactive", "invited"];

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<StaffBody>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = assertString(principal.hospitalId, "Hospital");
    requireEntityAccess(principal, "hospital", hospitalId);
    const db = await createRouteSupabase();
    const email = assertString(body.email, "Email", 180).toLowerCase();
    const name = assertString(body.name, "Nome", 120);
    const role = normalizeRole(body.role);
    const { data, error } = await db.from("hospital_staff").upsert({
      email,
      hospital_id: hospitalId,
      invited_by: principal.authUserId,
      name,
      staff_role: role,
      status: "invited",
      updated_at: new Date().toISOString()
    }, { onConflict: "hospital_id,email" }).select("*").single();
    if (error) throw new Error(`hospital_staff upsert: ${error.message}`);
    await auditApiAction(principal, `Convidou ${email} como ${role} no hospital ${hospitalId}.`);
    return data;
  });
}

export async function PATCH(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<StaffBody>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = assertString(principal.hospitalId, "Hospital");
    requireEntityAccess(principal, "hospital", hospitalId);
    const staffId = assertString(body.staffId, "Membro");
    const status = normalizeStatus(body.status);
    const db = await createRouteSupabase();
    const { data, error } = await db
      .from("hospital_staff")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", staffId)
      .eq("hospital_id", hospitalId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`hospital_staff update: ${error.message}`);
    if (!data) throw new ApiError(404, "Membro da equipa não encontrado.");
    await auditApiAction(principal, `Atualizou equipa do hospital ${hospitalId}: ${data.email} ficou ${status}.`);
    return data;
  });
}

function normalizeRole(value?: string) {
  if (!roles.includes(value ?? "")) throw new ApiError(400, "Função da equipa inválida.");
  return value;
}

function normalizeStatus(value?: string) {
  if (!statuses.includes(value ?? "")) throw new ApiError(400, "Estado da equipa inválido.");
  return value;
}
