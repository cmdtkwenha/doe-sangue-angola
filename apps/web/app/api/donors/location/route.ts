import { apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";

type LocationBody = {
  latitude?: number;
  locationPermissionStatus?: string;
  longitude?: number;
};

export async function PATCH(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<LocationBody>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const db = await createRouteSupabase();
    const { error } = await db
      .from("donors")
      .update({
        latitude: validCoordinate(body.latitude) ? body.latitude : null,
        location_permission_status: statusValue(body.locationPermissionStatus),
        longitude: validCoordinate(body.longitude) ? body.longitude : null
      })
      .eq("user_id", principal.authUserId);
    if (error && isMissingLocationColumn(error)) return { ok: true, stored: false };
    if (error) throw error;
    return { ok: true, stored: true };
  });
}

function isMissingLocationColumn(error: { code?: string; message?: string }) {
  return error.code === "PGRST204" || /latitude|longitude|location_permission_status/i.test(error.message ?? "");
}

function validCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function statusValue(value?: string) {
  return ["denied", "granted", "prompt", "unavailable"].includes(value ?? "")
    ? value
    : "unknown";
}
