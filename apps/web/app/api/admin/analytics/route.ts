import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [donors, hospitals, requests, responses, inventory, profiles] = await Promise.all([
      read(db, "donors", "id,user_id,blood_type,province,municipality,available,eligibility_status,last_donation,last_donation_date,points,reliability_score,response_speed_minutes,created_at"),
      read(db, "hospitals", "id,name,province,municipality,verified,verification_status,created_at"),
      read(db, "blood_requests", "id,hospital_id,blood_type,units_needed,urgency,status,province,municipality,created_at"),
      read(db, "donor_responses", "id,donor_id,hospital_id,blood_request_id,status,eta_minutes,created_at,accepted_at,cancelled_at,completed_at,donation_completed_at"),
      read(db, "hospital_inventory", "hospital_id,blood_type,units_available,minimum_threshold,critical_threshold,safe_minimum,updated_at"),
      read(db, "profiles", "id,role,linked_entity_id,name,email,last_activity_at,created_at")
    ]);
    return { donors, hospitals, inventory, profiles, requests, responses };
  });
}

async function read(db: Awaited<ReturnType<typeof createRouteSupabase>>, table: string, columns: string) {
  const { data, error } = await db.from(table).select(columns).limit(10000);
  if (error) throw new Error(`${table} select: ${error.message}`);
  return data ?? [];
}
