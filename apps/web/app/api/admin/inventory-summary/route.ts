import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

type InventoryRow = {
  blood_type: string;
  hospital_id: string | null;
  safe_minimum: number | null;
  units_available: number | null;
};
type HospitalRow = { id: string; province: string | null };

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [{ data, error }, { data: hospitals, error: hospitalError }] = await Promise.all([
      db
      .from("hospital_inventory")
      .select("hospital_id,blood_type,units_available,safe_minimum")
      .order("blood_type", { ascending: true }),
      db.from("hospitals").select("id,province")
    ]);
    if (error) throw new Error(`hospital_inventory select: ${error.message}`);
    if (hospitalError) throw new Error(`hospitals select: ${hospitalError.message}`);

    const totals = new Map<string, { safeMinimum: number; units: number }>();
    ((data ?? []) as InventoryRow[]).forEach((row) => {
      const current = totals.get(row.blood_type) ?? { safeMinimum: 0, units: 0 };
      current.safeMinimum += Number(row.safe_minimum ?? 0);
      current.units += Number(row.units_available ?? 0);
      totals.set(row.blood_type, current);
    });

    const items = Array.from(totals, ([bloodType, item]) => ({
      bloodType,
      safeMinimum: item.safeMinimum,
      units: item.units
    }));
    const shortagesByProvince = buildShortagesByProvince(
      (data ?? []) as InventoryRow[],
      (hospitals ?? []) as HospitalRow[]
    );
    return { items, shortagesByProvince };
  });
}

function buildShortagesByProvince(rows: InventoryRow[], hospitals: HospitalRow[]) {
  const totals = new Map<string, { critical: number; low: number }>();
  const provinceByHospital = new Map(hospitals.map((hospital) => [hospital.id, hospital.province]));
  rows.forEach((row) => {
    const province = provinceByHospital.get(row.hospital_id ?? "") ?? "Sem província";
    const item = totals.get(province) ?? { critical: 0, low: 0 };
    const units = Number(row.units_available ?? 0);
    const minimum = Number(row.safe_minimum ?? 1);
    if (units <= Math.max(1, Math.floor(minimum / 2))) item.critical += 1;
    else if (units < minimum) item.low += 1;
    totals.set(province, item);
  });
  return Array.from(totals, ([province, item]) => ({
    province,
    critical: item.critical,
    low: item.low
  })).filter((item) => item.critical || item.low);
}
