import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

export const dynamic = "force-dynamic";

type Row = Record<string, string | number | boolean | null>;

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [donors, hospitals, requests, responses] = await Promise.all([
      readTable(db, "donors", "id,user_id,blood_type,province,municipality,available,points,created_at"),
      readTable(db, "hospitals", "id,name,type,province,municipality,phone,email,verified"),
      readTable(db, "blood_requests", "id,hospital_id,blood_type,units_needed,urgency,status,province,municipality,created_at"),
      readTable(db, "donor_responses", "id,donor_id,blood_request_id,hospital_id,status,eta_minutes,created_at")
    ]);

    return { donors, hospitals, requests, responses };
  });
}

async function readTable(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  table: string,
  columns: string
) {
  const { data, error } = await db
    .from(table)
    .select(columns)
    .limit(1000);
  if (error) throw new Error(`${table}: ${error.message}`);
  return ((data ?? []) as unknown as Row[]).map(normalizeRow);
}

function normalizeRow(row: Row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, value == null ? "" : String(value)])
  );
}
