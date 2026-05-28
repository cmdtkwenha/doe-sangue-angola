import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

type InventoryRow = {
  blood_type: string;
  safe_minimum: number | null;
  units_available: number | null;
};

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const { data, error } = await db
      .from("hospital_inventory")
      .select("blood_type,units_available,safe_minimum")
      .order("blood_type", { ascending: true });
    if (error) throw new Error(`hospital_inventory select: ${error.message}`);

    const totals = new Map<string, { safeMinimum: number; units: number }>();
    ((data ?? []) as InventoryRow[]).forEach((row) => {
      const current = totals.get(row.blood_type) ?? { safeMinimum: 0, units: 0 };
      current.safeMinimum += Number(row.safe_minimum ?? 0);
      current.units += Number(row.units_available ?? 0);
      totals.set(row.blood_type, current);
    });

    return Array.from(totals, ([bloodType, item]) => ({
      bloodType,
      safeMinimum: item.safeMinimum,
      units: item.units
    }));
  });
}
