import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { ApiError, apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

export type AcceptedDonorRow = {
  acceptedAt?: string;
  age?: number;
  bloodRequestId?: string;
  completedDonations?: number;
  createdAt?: string;
  donorBloodType: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  eta: string;
  gender?: string;
  hospitalId: string;
  hospitalName: string;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  pin: string;
  pinValidationStatus?: string;
  reliabilityScore?: number;
  responseId: string;
  requestBloodType: string;
  requestStatus: string;
  status: string;
  totalDonations?: number;
  verificationStatus?: string;
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
      .select("id,donor_id,hospital_id,blood_request_id,created_at,eta_minutes,confirmation_pin,status,accepted_at,pin_validated_at")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });
    if (error) throw supabaseError("Não foi possível carregar dadores aceites", error);
    if (!responses?.length) return [];

    const donorIds = unique(responses.map((item) => item.donor_id));
    const requestIds = unique(responses.map((item) => item.blood_request_id));
    const [{ data: donors, error: donorError }, { data: requests, error: requestError }, hospital] =
      await Promise.all([
        db.from("donors").select("id,user_id,blood_type,birth_date,gender,emergency_contact_name,emergency_contact_phone,last_donation,last_donation_date,next_eligible_donation_date,reliability_score").in("id", donorIds),
        db.from("blood_requests").select("id,blood_type,status").in("id", requestIds),
        getHospital(db, hospitalId ?? "")
      ]);
    if (donorError) throw supabaseError("Não foi possível carregar dados dos dadores", donorError);
    if (requestError) throw supabaseError("Não foi possível carregar pedidos de sangue", requestError);
    const users = await getUsers(db, unique((donors ?? []).map((item) => item.user_id)));
    const metrics = await getDonationMetrics(db, donorIds);

    return responses.map((item) => {
      const donor = donors?.find((row) => row.id === item.donor_id);
      const user = users.find((row) => row.id === donor?.user_id);
      const request = requests?.find((row) => row.id === item.blood_request_id);
      const completed = metrics.get(item.donor_id) ?? 0;
      return {
        acceptedAt: item.accepted_at ?? item.created_at ?? undefined,
        age: ageFromBirthDate(donor?.birth_date),
        bloodRequestId: item.blood_request_id ?? undefined,
        completedDonations: completed,
        createdAt: item.created_at ?? undefined,
        donorBloodType: donor?.blood_type ?? "-",
        donorId: item.donor_id,
        donorName: user?.name ?? "Dador aceite",
        donorPhone: user?.phone ?? "por completar",
        emergencyContactName: donor?.emergency_contact_name ?? undefined,
        emergencyContactPhone: donor?.emergency_contact_phone ?? undefined,
        eta: `${item.eta_minutes ?? 30} min`,
        gender: donor?.gender ?? undefined,
        hospitalId: item.hospital_id,
        hospitalName: hospital.name,
        lastDonationDate: donor?.last_donation_date ?? donor?.last_donation ?? undefined,
        nextEligibleDate: donor?.next_eligible_donation_date ?? undefined,
        pin: item.confirmation_pin ?? "----",
        pinValidationStatus: item.pin_validated_at ? "PIN Validado" : normalizeStatus(item.status),
        reliabilityScore: donor?.reliability_score ?? undefined,
        responseId: item.id,
        requestBloodType: request?.blood_type ?? "-",
        requestStatus: request?.status ?? "-",
        status: normalizeStatus(item.status),
        totalDonations: completed,
        verificationStatus: user?.id ? "Verificado" : "Pendente"
      } satisfies AcceptedDonorRow;
    });
  });
}

async function getDonationMetrics(db: Awaited<ReturnType<typeof createRouteSupabase>>, donorIds: string[]) {
  const metrics = new Map<string, number>();
  if (!donorIds.length) return metrics;
  const { data, error } = await db
    .from("donor_responses")
    .select("donor_id,status")
    .in("donor_id", donorIds)
    .eq("status", "completed");
  if (error) throw supabaseError("Não foi possível carregar métricas de doação", error);
  (data ?? []).forEach((row) => metrics.set(row.donor_id, (metrics.get(row.donor_id) ?? 0) + 1));
  return metrics;
}

function ageFromBirthDate(value?: string | null) {
  if (!value) return undefined;
  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : undefined;
}

async function getUsers(db: Awaited<ReturnType<typeof createRouteSupabase>>, ids: string[]) {
  if (!ids.length) return [] as Array<{ id: string; name: string | null; phone: string | null }>;
  const { data, error } = await db
    .from("users")
    .select("id,name,phone")
    .in("id", ids);
  if (error) throw supabaseError("Não foi possível carregar contactos dos dadores", error);
  return data ?? [];
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

async function getHospital(db: Awaited<ReturnType<typeof createRouteSupabase>>, id: string) {
  const { data, error } = await db
    .from("hospitals")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  if (error) throw supabaseError("Não foi possível carregar o hospital", error);
  return {
    name: data?.name ?? "Hospital"
  };
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
