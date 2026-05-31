import { bloodTypes, minimumStockByType } from "@doe-sangue-angola/shared-services";
import type { BloodType } from "@doe-sangue-angola/shared-types";
import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertBloodType, assertString, assertUnits, optionalString } from "../../_utils/validation";

export type InventoryRow = {
  bloodType: string;
  daysRemaining: number;
  safeMinimum: number;
  status: "Adequado" | "Baixo" | "Crítico";
  trend: string;
  units: number;
};

type MovementBody = {
  bloodType: BloodType;
  movementType: "donation_received" | "stock_added" | "stock_consumed" | "stock_expired";
  note?: string;
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
    const byType = new Map((data ?? []).map((item) => [item.blood_type, item]));
    return bloodTypes.map((bloodType) => {
      const item = byType.get(bloodType);
      const units = item?.units_available ?? 0;
      const days = Math.floor(units / Math.max(Number(item?.daily_usage_estimate ?? 1), 1));
      return {
        bloodType,
        daysRemaining: days,
        safeMinimum: item?.safe_minimum ?? minimumStockByType[bloodType],
        status: statusFor(units, item?.safe_minimum ?? minimumStockByType[bloodType]),
        trend: days <= 2 ? "queda prevista" : "estável",
        units
      } satisfies InventoryRow;
    });
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await request.json().catch(() => ({})) as Partial<MovementBody>;
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = assertString(principal.hospitalId, "Hospital");
    requireEntityAccess(principal, "hospital", hospitalId);
    const bloodType = assertBloodType(body.bloodType);
    const movementType = assertMovement(body.movementType);
    const units = assertUnits(body.units);
    const db = await createRouteSupabase();
    const current = await findInventory(db, hospitalId, bloodType);
    const nextUnits = calculateNextUnits(current?.units_available ?? 0, units, movementType);
    await saveInventory(db, {
      bloodType,
      hospitalId,
      safeMinimum: current?.safe_minimum ?? minimumStockByType[bloodType],
      units: nextUnits
    });
    const { error: movementError } = await db.from("inventory_movements").insert({
      blood_type: bloodType,
      created_by: principal.authUserId,
      hospital_id: hospitalId,
      movement_type: movementType,
      note: optionalString(body.note, 240),
      units
    });
    if (movementError) throw new Error(`inventory_movements insert: ${movementError.message}`);
    await auditApiAction(principal, `${movementLabel(movementType)} ${units} unidade(s) ${bloodType}.`);
    return { bloodType, units: nextUnits };
  });
}

function statusFor(units: number, minimum: number): InventoryRow["status"] {
  if (units <= Math.max(1, Math.floor(minimum / 2))) return "Crítico";
  if (units < minimum) return "Baixo";
  return "Adequado";
}

function assertMovement(value: unknown): MovementBody["movementType"] {
  const movement = assertString(value, "Movimento");
  const allowed = ["donation_received", "stock_added", "stock_consumed", "stock_expired"];
  if (!allowed.includes(movement)) throw new ApiError(400, "Tipo de movimento inválido.");
  return movement as MovementBody["movementType"];
}

function calculateNextUnits(current: number, units: number, movement: MovementBody["movementType"]) {
  const delta = ["stock_consumed", "stock_expired"].includes(movement) ? -units : units;
  return Math.max(0, current + delta);
}

async function findInventory(db: Awaited<ReturnType<typeof createRouteSupabase>>, hospitalId: string, bloodType: BloodType) {
  const { data, error } = await db
    .from("hospital_inventory")
    .select("id,units_available,safe_minimum")
    .eq("hospital_id", hospitalId)
    .eq("blood_type", bloodType)
    .maybeSingle();
  if (error) throw new Error(`hospital_inventory select: ${error.message}`);
  return data;
}

async function saveInventory(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  input: { bloodType: BloodType; hospitalId: string; safeMinimum: number; units: number }
) {
  const { error } = await db.from("hospital_inventory").upsert({
    blood_type: input.bloodType,
    hospital_id: input.hospitalId,
    safe_minimum: input.safeMinimum,
    units_available: input.units,
    updated_at: new Date().toISOString()
  }, { onConflict: "hospital_id,blood_type" });
  if (error) throw new Error(`hospital_inventory upsert: ${error.message}`);
}

function movementLabel(movement: MovementBody["movementType"]) {
  return {
    donation_received: "Recebeu doação no inventário",
    stock_added: "Adicionou stock ao inventário",
    stock_consumed: "Consumiu stock do inventário",
    stock_expired: "Expirou stock do inventário"
  }[movement];
}
