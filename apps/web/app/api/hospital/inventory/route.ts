import { ApiError, apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireEntityAccess } from "../../_utils/security";

export type InventoryRow = {
  bloodType: string;
  daysRemaining: number;
  safeMinimum: number;
  status: "Adequado" | "Baixo" | "Crítico";
  trend: string;
  units: number;
};

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = new URL(request.url).searchParams.get("hospitalId") ?? principal.hospitalId;
    if (!hospitalId) throw new ApiError(403, "Hospital ainda não ligado ao perfil.");
    requireEntityAccess(principal, "hospital", hospitalId);
    const db = await createRouteSupabase();
    const { data, error } = await db
      .from("hospital_inventory")
      .select("blood_type,units_available,daily_usage_estimate,safe_minimum,updated_at")
      .eq("hospital_id", hospitalId)
      .order("blood_type", { ascending: true });
    if (error) throw new Error(`Inventário indisponível. ${error.message}`);
    return (data ?? []).map((item) => {
      const units = item.units_available ?? 0;
      const days = Math.floor(units / Math.max(Number(item.daily_usage_estimate ?? 1), 1));
      return {
        bloodType: item.blood_type,
        daysRemaining: days,
        safeMinimum: item.safe_minimum ?? 5,
        status: statusFor(units, item.safe_minimum ?? 5),
        trend: days <= 2 ? "queda prevista" : "estável",
        units
      } satisfies InventoryRow;
    });
  });
}

function statusFor(units: number, minimum: number): InventoryRow["status"] {
  if (units <= Math.max(1, Math.floor(minimum / 2))) return "Crítico";
  if (units < minimum) return "Baixo";
  return "Adequado";
}
