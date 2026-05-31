import { defaultPushPreferences } from "@doe-sangue-angola/shared-services";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const donorId = new URL(request.url).searchParams.get("donorId") ?? principal.donorId;
    if (!donorId) throw new ApiError(403, "Perfil de dador em falta.");
    requireEntityAccess(principal, "donor", donorId);
    const db = await createRouteSupabase();
    const { data, error } = await db
      .from("notification_preferences")
      .select("preferences")
      .eq("donor_id", donorId)
      .maybeSingle();
    if (error) throw new Error(`notification_preferences select: ${error.message}`);
    return normalizePreferences(data?.preferences);
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ donorId: string; preferences: Record<string, unknown> }>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const donorId = assertString(body.donorId ?? principal.donorId, "Dador");
    requireEntityAccess(principal, "donor", donorId);
    const preferences = normalizePreferences(body.preferences);
    const db = await createRouteSupabase();
    const { error } = await db.from("notification_preferences").upsert({
      donor_id: donorId,
      preferences
    }, { onConflict: "donor_id" });
    if (error) throw new Error(`notification_preferences upsert: ${error.message}`);
    return preferences;
  });
}

function normalizePreferences(value: unknown) {
  const input = (value ?? {}) as Record<string, unknown>;
  return {
    ...defaultPushPreferences,
    appointment_reminder: Boolean(input.appointment_reminder ?? true),
    completed_donation: Boolean(input.completed_donation ?? true),
    emergency_request: Boolean(input.emergency_request ?? true),
    in_app: Boolean(input.in_app ?? true),
    pin_updates: Boolean(input.pin_updates ?? true),
    preferred_method: String(input.preferred_method ?? "in-app"),
    reminder: Boolean(input.reminder ?? true)
  };
}
