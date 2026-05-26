import { ApiError, apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

export type AcceptedDonorRow = {
  appointmentId: string;
  bloodRequestId?: string;
  createdAt?: string;
  donorBloodType: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  eta: string;
  hospitalId: string;
  hospitalName: string;
  pin: string;
  requestBloodType: string;
  requestStatus: string;
  status: string;
};

export async function GET() {
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = principal.hospitalId;
    if (!hospitalId && principal.role !== "admin") {
      throw new ApiError(403, "Hospital ainda não ligado ao perfil.");
    }
    const db = await createRouteSupabase();
    const { data: appointments, error } = await db
      .from("appointments")
      .select("id,donor_id,hospital_id,blood_request_id,created_at,time,pin,status")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!appointments?.length) return [];

    const donorIds = unique(appointments.map((item) => item.donor_id));
    const requestIds = unique(appointments.map((item) => item.blood_request_id));
    const [{ data: donors, error: donorError }, { data: requests, error: requestError }, hospital] =
      await Promise.all([
        db.from("donors").select("id,full_name,blood_type,phone").in("id", donorIds),
        db.from("blood_requests").select("id,blood_type,status").in("id", requestIds),
        getHospitalName(db, hospitalId ?? "")
      ]);
    if (donorError) throw donorError;
    if (requestError) throw requestError;

    return appointments.map((item) => {
      const donor = donors?.find((row) => row.id === item.donor_id);
      const request = requests?.find((row) => row.id === item.blood_request_id);
      return {
        appointmentId: item.id,
        bloodRequestId: item.blood_request_id ?? undefined,
        createdAt: item.created_at ?? undefined,
        donorBloodType: donor?.blood_type ?? "-",
        donorId: item.donor_id,
        donorName: donor?.full_name ?? "Dador aceite",
        donorPhone: donor?.phone ?? "por completar",
        eta: item.time ?? "ETA pendente",
        hospitalId: item.hospital_id,
        hospitalName: hospital,
        pin: item.pin ?? "----",
        requestBloodType: request?.blood_type ?? "-",
        requestStatus: request?.status ?? "-",
        status: item.status ?? "Pendente"
      } satisfies AcceptedDonorRow;
    });
  });
}

async function getHospitalName(db: Awaited<ReturnType<typeof createRouteSupabase>>, id: string) {
  const { data, error } = await db.from("hospitals").select("name").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.name ?? "Hospital";
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
