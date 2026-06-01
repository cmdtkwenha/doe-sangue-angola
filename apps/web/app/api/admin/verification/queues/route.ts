import {
  mapDonor,
  mapHospital,
  type DonorRow,
  type HospitalRow
} from "@doe-sangue-angola/shared-services";
import { apiResponse } from "../../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../../_utils/security";

type AnyRow = Record<string, unknown>;

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [hospitalRows, donorRows] = await Promise.all([
      db.from("hospitals").select("*").order("name"),
      db.from("donors").select("*").order("created_at", { ascending: false })
    ]);
    if (hospitalRows.error) throw new Error(`hospitals select: ${hospitalRows.error.message}`);
    if (donorRows.error) throw new Error(`donors select: ${donorRows.error.message}`);

    const donors = (donorRows.data ?? []) as DonorRow[];
    const users = await loadUsers(db, donors.map((row) => row.user_id));

    return {
      dataSource: "Supabase",
      donorStatusField: "eligibility_status",
      donors: donors
        .filter((row) => isPendingDonor(row as AnyRow))
        .map((row) => enrichDonor(row, users)),
      hospitalStatusField: "verification_status",
      hospitals: ((hospitalRows.data ?? []) as HospitalRow[])
        .filter((row) => isPendingHospital(row as AnyRow))
        .map(mapHospital)
    };
  });
}

async function loadUsers(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  ids: Array<string | null | undefined>
) {
  const userIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (!userIds.length) return new Map<string, { email?: string; name?: string; phone?: string }>();
  const { data, error } = await db.from("users").select("id,name,email,phone").in("id", userIds);
  if (error) throw new Error(`users select: ${error.message}`);
  return new Map((data ?? []).map((row) => [row.id, row]));
}

function enrichDonor(
  row: DonorRow,
  users: Map<string, { email?: string; name?: string; phone?: string }>
) {
  const donor = mapDonor(row);
  const user = users.get(row.user_id ?? "");
  return {
    ...donor,
    email: user?.email ?? donor.email,
    name: user?.name ?? donor.name,
    phone: user?.phone ?? donor.phone
  };
}

function isPendingHospital(row: AnyRow) {
  const status = String(row.status ?? row.verification_status ?? (row.verified ? "verified" : "pending"));
  return status === "pending" || status === "needs_review";
}

function isPendingDonor(row: AnyRow) {
  const status = String(row.status ?? row.eligibility_status ?? "eligible");
  return status === "pending_verification" || status === "needs_review";
}
