import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertString, optionalString } from "../../_utils/validation";

type SettingsBody = {
  emergencyContact?: string;
  mainContactPerson?: string;
  operatingHours?: string;
  operationalEmail?: string;
  operationalPhone?: string;
  preferences?: Record<string, boolean | string>;
};

const defaultPreferences = {
  donor_arrival: true,
  emergency_requests: true,
  inventory_alerts: true,
  pin_updates: true,
  preferred_method: "in-app"
};

export async function GET() {
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = assertString(principal.hospitalId, "Hospital");
    requireEntityAccess(principal, "hospital", hospitalId);
    const db = await createRouteSupabase();
    const [hospital, preferences, staff] = await Promise.all([
      db.from("hospitals").select("*").eq("id", hospitalId).maybeSingle(),
      db.from("hospital_notification_preferences").select("preferences").eq("hospital_id", hospitalId).maybeSingle(),
      db.from("hospital_staff").select("*").eq("hospital_id", hospitalId).order("created_at", { ascending: false })
    ]);
    if (hospital.error) throw new Error(`hospitals select: ${hospital.error.message}`);
    if (!hospital.data) throw new ApiError(404, "Hospital não encontrado.");
    if (preferences.error) throw new Error(`hospital_notification_preferences select: ${preferences.error.message}`);
    if (staff.error) throw new Error(`hospital_staff select: ${staff.error.message}`);
    return {
      hospital: hospital.data,
      preferences: { ...defaultPreferences, ...(preferences.data?.preferences ?? {}) },
      staff: staff.data ?? []
    };
  });
}

export async function PATCH(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<SettingsBody>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = assertString(principal.hospitalId, "Hospital");
    requireEntityAccess(principal, "hospital", hospitalId);
    const db = await createRouteSupabase();
    const payload = {
      emergency_contact: optionalString(body.emergencyContact, 120),
      main_contact_person: optionalString(body.mainContactPerson, 120),
      operating_hours: optionalString(body.operatingHours, 180),
      operational_email: optionalString(body.operationalEmail, 180),
      operational_phone: optionalString(body.operationalPhone, 60)
    };
    const { error } = await db.from("hospitals").update(payload).eq("id", hospitalId);
    if (error) throw new Error(`hospitals update: ${error.message}`);
    if (body.preferences) {
      const { error: prefError } = await db.from("hospital_notification_preferences").upsert({
        hospital_id: hospitalId,
        preferences: { ...defaultPreferences, ...body.preferences },
        updated_at: new Date().toISOString()
      }, { onConflict: "hospital_id" });
      if (prefError) throw new Error(`hospital_notification_preferences upsert: ${prefError.message}`);
      await auditApiAction(principal, `Atualizou preferências de notificação do hospital ${hospitalId}.`);
    }
    await auditApiAction(principal, `Atualizou contactos operacionais do hospital ${hospitalId}.`);
    return { updated: true };
  });
}
