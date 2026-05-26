import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

export type DonorPinResponse = {
  bloodRequestId: string;
  etaMinutes: number;
  hospitalName: string;
  pin: string;
  requestBloodType: string;
  status: string;
};

export async function GET() {
  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const db = await createRouteSupabase();
    const { data: donor, error: donorError } = await db
      .from("donors")
      .select("id")
      .eq("user_id", principal.authUserId)
      .maybeSingle();
    if (donorError) throw donorError;
    if (!donor?.id) return [];

    const { data: responses, error } = await db
      .from("donor_responses")
      .select("blood_request_id,hospital_id,status,eta_minutes,confirmation_pin")
      .eq("donor_id", donor.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!responses?.length) return [];

    const hospitalIds = unique(responses.map((item) => item.hospital_id));
    const requestIds = unique(responses.map((item) => item.blood_request_id));
    const [{ data: hospitals, error: hospitalError }, { data: requests, error: requestError }] =
      await Promise.all([
        db.from("hospitals").select("id,name").in("id", hospitalIds),
        db.from("blood_requests").select("id,blood_type").in("id", requestIds)
      ]);
    if (hospitalError) throw hospitalError;
    if (requestError) throw requestError;

    return responses.map((item) => {
      const hospital = hospitals?.find((row) => row.id === item.hospital_id);
      const request = requests?.find((row) => row.id === item.blood_request_id);
      return {
        bloodRequestId: item.blood_request_id,
        etaMinutes: item.eta_minutes ?? 30,
        hospitalName: hospital?.name ?? "Hospital",
        pin: item.confirmation_pin ?? "----",
        requestBloodType: request?.blood_type ?? "-",
        status: item.status ?? "Aceite"
      } satisfies DonorPinResponse;
    });
  });
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
