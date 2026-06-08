import { ApiError, apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";
import { activeDonorStatuses, ageFromBirthDate, cleanName, isActiveDonorStatus, normalizeStatus, unique } from "../acceptedDonorHelpers";

const activeRequestStatuses = ["Aberto", "Dador a Caminho", "PIN Validado"];

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
  eligibilityStatus?: string;
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

export async function GET(request: Request) {
  return apiResponse(async () => {
    const scope = new URL(request.url).searchParams.get("scope") ?? "active";
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = principal.hospitalId;
    if (!hospitalId && principal.role !== "admin") {
      throw new ApiError(403, "Hospital ainda não ligado ao perfil.");
    }
    const db = await createRouteSupabase();
    const { data: responseRows, error } = await db
      .from("donor_responses")
      .select("id,donor_id,hospital_id,blood_request_id,created_at,eta_minutes,confirmation_pin,status,accepted_at,pin_validated_at")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });
    if (error) throw supabaseError("Não foi possível carregar dadores aceites", error);
    const responses = mergeResponses(
      responseRows ?? [],
      await acceptanceFallback(db, hospitalId ?? "", responseRows ?? [], scope)
    ).filter((item) => scope === "all" || isActiveDonorStatus(item.status));
    if (!responses?.length) return [];

    const donorIds = unique(responses.map((item) => item.donor_id));
    const requestIds = unique(responses.map((item) => item.blood_request_id));
    const [{ data: donors, error: donorError }, { data: requests, error: requestError }, hospital] =
      await Promise.all([
        db.from("donors").select("id,user_id,blood_type,phone,birth_date,gender,emergency_contact_name,emergency_contact_phone,eligibility_status,last_donation,last_donation_date,next_eligible_donation_date,reliability_score").in("id", donorIds),
        db.from("blood_requests").select("id,blood_type,status").in("id", requestIds),
        getHospital(db, hospitalId ?? "")
      ]);
    if (donorError) throw supabaseError("Não foi possível carregar dados dos dadores", donorError);
    if (requestError) throw supabaseError("Não foi possível carregar pedidos de sangue", requestError);
    const users = await getUsers(db, unique((donors ?? []).map((item) => item.user_id)));
    const metrics = await getDonationMetrics(db, donorIds);
    const visibleResponses = scope === "all"
      ? responses
      : responses.filter((item) => {
        const linkedRequest = requests?.find((row) => row.id === item.blood_request_id);
        return activeRequestStatuses.includes(linkedRequest?.status ?? "");
      });

    return visibleResponses.map((item) => {
      const donor = donors?.find((row) => row.id === item.donor_id);
      const user = users.find((row) => row.id === donor?.user_id);
      const request = requests?.find((row) => row.id === item.blood_request_id);
      const completed = metrics.get(item.donor_id) ?? 0;
      const donorName = cleanName(user?.name, user?.email);
      return {
        acceptedAt: item.accepted_at ?? item.created_at ?? undefined,
        age: ageFromBirthDate(donor?.birth_date),
        bloodRequestId: item.blood_request_id ?? undefined,
        completedDonations: completed,
        createdAt: item.created_at ?? undefined,
        donorBloodType: donor?.blood_type ?? "-",
        donorId: item.donor_id,
        donorName,
        donorPhone: user?.phone ?? donor?.phone ?? "por completar",
        emergencyContactName: donor?.emergency_contact_name ?? undefined,
        emergencyContactPhone: donor?.emergency_contact_phone ?? undefined,
        eligibilityStatus: donor?.eligibility_status ?? "Pendente",
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
    .eq("status", "Doação concluída");
  if (error) throw supabaseError("Não foi possível carregar métricas de doação", error);
  (data ?? []).forEach((row) => metrics.set(row.donor_id, (metrics.get(row.donor_id) ?? 0) + 1));
  return metrics;
}

async function getUsers(db: Awaited<ReturnType<typeof createRouteSupabase>>, ids: string[]) {
  type UserRow = { email: string | null; id: string; name: string | null; phone: string | null };
  if (!ids.length) return [] as UserRow[];
  const { data, error } = await db
    .from("users")
    .select("id,name,email,phone")
    .in("id", ids);
  if (error) throw supabaseError("Não foi possível carregar contactos dos dadores", error);
  return data ?? [];
}

type ResponseLike = {
  accepted_at?: string | null;
  blood_request_id: string;
  confirmation_pin?: string | null;
  created_at?: string | null;
  donor_id: string;
  eta_minutes?: number | null;
  hospital_id: string;
  id: string;
  pin_validated_at?: string | null;
  status?: string | null;
};

async function acceptanceFallback(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  hospitalId: string,
  existing: ResponseLike[],
  scope: string
): Promise<ResponseLike[]> {
  if (!hospitalId) return [];
  const known = new Set(existing.map((item) => `${item.donor_id}:${item.blood_request_id}`));
  const { data, error } = await db
    .from("request_acceptances")
    .select("id,donor_id,hospital_id,request_id,pin,status,accepted_at,created_at")
    .eq("hospital_id", hospitalId)
    .order("created_at", { ascending: false });
  if (error) throw supabaseError("Não foi possível carregar aceitações do pedido", error);
  return (data ?? [])
    .filter((item) => !known.has(`${item.donor_id}:${item.request_id}`))
    .filter((item) => scope === "all" || activeDonorStatuses.includes(item.status))
    .map((item) => ({
      accepted_at: item.accepted_at ?? item.created_at,
      blood_request_id: item.request_id,
      confirmation_pin: item.pin,
      created_at: item.created_at,
      donor_id: item.donor_id,
      eta_minutes: 30,
      hospital_id: item.hospital_id,
      id: item.id,
      pin_validated_at: item.status === "PIN Validado" ? item.accepted_at : null,
      status: item.status
    }));
}

function mergeResponses(primary: ResponseLike[], fallback: ResponseLike[]) {
  return [...primary, ...fallback].sort((left, right) =>
    new Date(right.created_at ?? right.accepted_at ?? 0).getTime() -
    new Date(left.created_at ?? left.accepted_at ?? 0).getTime()
  );
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

function supabaseError(label: string, error: {
  code?: string;
  details?: string;
  message: string;
}) {
  return new Error(`${label}. ${error.message}`);
}
