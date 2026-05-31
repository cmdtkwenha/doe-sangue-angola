import { notifyAdmins } from "../_utils/notifications";
import { notifyMatchedDonors } from "../_utils/requestNotifications";
import { auditApiAction } from "../_utils/audit";
import { ApiError, apiResponse, readJson } from "../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../_utils/security";
import { assertBloodType, assertString, assertUnits, assertUrgency, optionalString } from "../_utils/validation";
import { donorColumns, requestColumns } from "../blood-requests/columns";

type FamilyBody = {
  bloodType: string;
  contactName: string;
  contactPhone: string;
  hospitalName: string;
  municipality: string;
  patientName: string;
  province: string;
  relationship: string;
  unitsNeeded: number;
  urgency: string;
};

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const status = new URL(request.url).searchParams.get("status");
    const db = await createRouteSupabase();
    let query = db.from("family_emergency_requests").select("*").order("created_at", { ascending: false });
    if (principal.role !== "admin") query = query.in("status", ["approved", "active"]);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw new Error(`family_emergency_requests select: ${error.message}`);
    return data ?? [];
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<FamilyBody>(request);
  return apiResponse(async () => {
    const input = familyInput(body);
    const db = await createRouteSupabase();
    const { data, error } = await db
      .from("family_emergency_requests")
      .insert(input)
      .select("*")
      .single();
    if (error) throw new Error(`family_emergency_requests insert: ${error.message}`);
    await notifyAdmins(db, "Pedido familiar recebido", `${input.blood_type} em ${input.hospital_name}.`, "family");
    await publicAudit(db, "Pedido familiar submetido");
    return data;
  });
}

export async function PATCH(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ action: string; id: string; note?: string }>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const id = assertString(body.id, "Pedido familiar");
    const action = assertAction(body.action);
    const note = optionalString(body.note, 240);
    const { data: family, error } = await db.from("family_emergency_requests").select("*").eq("id", id).single();
    if (error) throw new Error(`family_emergency_requests select: ${error.message}`);
    if (action === "approved") {
      const requestRecord = await approveFamilyRequest(db, family, principal.authUserId, note);
      await auditApiAction(principal, `Aprovou pedido familiar ${id}.`);
      return requestRecord;
    }
    const status = action === "more_info" ? "pending_review" : "cancelled";
    const { data, error: updateError } = await db
      .from("family_emergency_requests")
      .update({ review_note: note, status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (updateError) throw new Error(`family_emergency_requests update: ${updateError.message}`);
    await auditApiAction(principal, `${action === "cancelled" ? "Cancelou" : "Solicitou mais informação para"} pedido familiar ${id}.`);
    return data;
  });
}

function familyInput(body: Partial<FamilyBody>) {
  const hospitalName = assertString(body.hospitalName, "Hospital", 180);
  const contactPhone = assertString(body.contactPhone, "Telefone", 40);
  return {
    blood_type: assertBloodType(body.bloodType),
    contact_name: assertString(body.contactName, "Contacto", 120),
    contact_phone: contactPhone,
    hospital_name: hospitalName,
    municipality: assertString(body.municipality, "Município", 120),
    patient_name: assertString(body.patientName, "Paciente", 120),
    province: assertString(body.province, "Província", 120),
    relationship: assertString(body.relationship, "Relação", 80),
    status: "pending_review",
    units_needed: assertUnits(body.unitsNeeded),
    urgency: assertUrgency(body.urgency)
  };
}

function assertAction(action: unknown) {
  const value = assertString(action, "Ação", 40);
  if (!["approved", "cancelled", "more_info"].includes(value)) throw new ApiError(400, "Ação inválida.");
  return value as "approved" | "cancelled" | "more_info";
}

async function approveFamilyRequest(db: Awaited<ReturnType<typeof createRouteSupabase>>, family: any, userId: string, note?: string) {
  const hospital = await findHospital(db, family);
  if (!hospital?.id) throw new ApiError(409, "Associe este pedido a um hospital aprovado antes de notificar dadores.");
  const { data, error } = await db.from("blood_requests").insert({
    blood_type: family.blood_type,
    created_by: userId,
    family_request_id: family.id,
    hospital_id: hospital.id,
    municipality: family.municipality,
    notes: `Pedido Familiar: ${family.patient_name}. Contacto: ${family.contact_name} ${family.contact_phone}.`,
    patient_code: `FAM-${family.id.slice(0, 8)}`,
    province: family.province,
    request_source: "family",
    status: "Aberto",
    units: family.units_needed,
    units_needed: family.units_needed,
    urgency: family.urgency
  }).select(requestColumns).single();
  if (error) throw new Error(`blood_requests insert family: ${error.message}`);
  const created = data as unknown as { id: string };
  await db.from("family_emergency_requests").update({
    blood_request_id: created.id,
    hospital_id: hospital.id,
    review_note: note,
    status: "active",
    updated_at: new Date().toISOString()
  }).eq("id", family.id);
  await notifyMatchedDonors(db, mapRequest(data as any), donorColumns);
  return data;
}

async function findHospital(db: Awaited<ReturnType<typeof createRouteSupabase>>, family: any) {
  if (family.hospital_id) return { id: family.hospital_id };
  const { data } = await db.from("hospitals").select("id").eq("name", family.hospital_name).eq("verified", true).maybeSingle();
  return data;
}

async function publicAudit(db: Awaited<ReturnType<typeof createRouteSupabase>>, action: string) {
  await db.from("audit_logs").insert({ actor_label: "Pedido Familiar Público", action });
}
import { mapRequest } from "@doe-sangue-angola/shared-services";
