import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { ApiError, apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

export type AcceptedDonorRow = {
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
  responseId: string;
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
    const { data: responses, error } = await db
      .from("donor_responses")
      .select("id,donor_id,hospital_id,blood_request_id,created_at,eta_minutes,confirmation_pin,status")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });
    if (error) throw supabaseError("Não foi possível carregar dadores aceites", error);
    if (!responses?.length) return [];

    const donorIds = unique(responses.map((item) => item.donor_id));
    const requestIds = unique(responses.map((item) => item.blood_request_id));
    const [{ data: donors, error: donorError }, { data: requests, error: requestError }, hospital] =
      await Promise.all([
        db.from("donors").select("id,full_name,blood_type,phone").in("id", donorIds),
        db.from("blood_requests").select("id,blood_type,status").in("id", requestIds),
        getHospitalName(db, hospitalId ?? "")
      ]);
    if (donorError) throw supabaseError("Não foi possível carregar dados dos dadores", donorError);
    if (requestError) throw supabaseError("Não foi possível carregar pedidos de sangue", requestError);

    return responses.map((item) => {
      const donor = donors?.find((row) => row.id === item.donor_id);
      const request = requests?.find((row) => row.id === item.blood_request_id);
      return {
        bloodRequestId: item.blood_request_id ?? undefined,
        createdAt: item.created_at ?? undefined,
        donorBloodType: donor?.blood_type ?? "-",
        donorId: item.donor_id,
        donorName: donor?.full_name ?? "Dador aceite",
        donorPhone: donor?.phone ?? "por completar",
        eta: `${item.eta_minutes ?? 30} min`,
        hospitalId: item.hospital_id,
        hospitalName: hospital,
        pin: item.confirmation_pin ?? "----",
        responseId: item.id,
        requestBloodType: request?.blood_type ?? "-",
        requestStatus: request?.status ?? "-",
        status: normalizeStatus(item.status)
      } satisfies AcceptedDonorRow;
    });
  });
}

function normalizeStatus(status?: string | null): DonorResponseStatus {
  const oldValues: Record<string, DonorResponseStatus> = {
    accepted: "accepted",
    arrived: "arrived",
    cancelled: "cancelled",
    Cancelado: "cancelled",
    Chegou: "arrived",
    completed: "completed",
    Concluido: "completed",
    "Concluído": "completed",
    pin_validated: "pin_validated",
    "PIN Validado": "pin_validated"
  };
  return oldValues[status ?? ""] ?? "accepted";
}

async function getHospitalName(db: Awaited<ReturnType<typeof createRouteSupabase>>, id: string) {
  const { data, error } = await db.from("hospitals").select("name").eq("id", id).maybeSingle();
  if (error) throw supabaseError("Não foi possível carregar o hospital", error);
  return data?.name ?? "Hospital";
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function supabaseError(label: string, error: {
  code?: string;
  details?: string;
  message: string;
}) {
  return new Error(`${label}. ${error.message}`);
}
