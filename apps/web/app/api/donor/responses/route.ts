import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { apiResponse } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

export type DonorPinResponse = {
  bloodRequestId: string;
  etaMinutes: number;
  hospitalLocation: string;
  hospitalName: string;
  pin: string;
  requestBloodType: string;
  responseId: string;
  status: string;
};

export async function GET() {
  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const db = await createRouteSupabase();
    const userIds = await resolvePublicUserIds(db, principal.authUserId);
    const { data: donor, error: donorError } = await db
      .from("donors")
      .select("id")
      .in("user_id", userIds)
      .maybeSingle();
    if (donorError) throw supabaseError("Não foi possível carregar o perfil de dador", donorError);
    if (!donor?.id) return [];

    const { data: responses, error } = await db
      .from("donor_responses")
      .select("id,blood_request_id,hospital_id,status,eta_minutes,confirmation_pin")
      .eq("donor_id", donor.id)
      .order("created_at", { ascending: false });
    if (error) throw supabaseError("Não foi possível carregar o PIN de doação", error);
    if (!responses?.length) return await acceptancePins(db, donor.id);

    const hospitalIds = unique(responses.map((item) => item.hospital_id));
    const requestIds = unique(responses.map((item) => item.blood_request_id));
    const [{ data: hospitals, error: hospitalError }, { data: requests, error: requestError }] =
      await Promise.all([
        db.from("hospitals").select("id,name,municipality,province").in("id", hospitalIds),
        db.from("blood_requests").select("id,blood_type").in("id", requestIds)
      ]);
    if (hospitalError) throw supabaseError("Não foi possível carregar o hospital", hospitalError);
    if (requestError) throw supabaseError("Não foi possível carregar o pedido", requestError);

    const activeResponses = responses.filter((item) => isActiveStatus(item.status));
    const ordered = (activeResponses.length ? activeResponses : responses).sort((left, right) =>
      Number(isOldStatus(left.status)) - Number(isOldStatus(right.status))
    );

    return ordered.map((item) => {
      const hospital = hospitals?.find((row) => row.id === item.hospital_id);
      const request = requests?.find((row) => row.id === item.blood_request_id);
      return {
        bloodRequestId: item.blood_request_id,
        etaMinutes: item.eta_minutes ?? 30,
        hospitalLocation: locationLabel(hospital),
        hospitalName: hospital?.name ?? "Hospital",
        pin: item.confirmation_pin ?? "----",
        requestBloodType: request?.blood_type ?? "-",
        responseId: item.id,
        status: normalizeStatus(item.status)
      } satisfies DonorPinResponse;
    });
  });
}

async function acceptancePins(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  donorId: string
) {
  const { data, error } = await db
    .from("request_acceptances")
    .select("id,request_id,hospital_id,status,pin")
    .eq("donor_id", donorId)
    .order("created_at", { ascending: false });
  if (error) throw supabaseError("Não foi possível carregar aceitações do dador", error);
  if (!data?.length) return [];
  const hospitalIds = unique(data.map((item) => item.hospital_id));
  const requestIds = unique(data.map((item) => item.request_id));
  const [{ data: hospitals }, { data: requests }] = await Promise.all([
    db.from("hospitals").select("id,name,municipality,province").in("id", hospitalIds),
    db.from("blood_requests").select("id,blood_type").in("id", requestIds)
  ]);
  const active = data.filter((item) => isActiveStatus(item.status));
  return (active.length ? active : data).map((item) => {
    const hospital = hospitals?.find((row) => row.id === item.hospital_id);
    const request = requests?.find((row) => row.id === item.request_id);
    return {
      bloodRequestId: item.request_id,
      etaMinutes: 30,
      hospitalLocation: locationLabel(hospital),
      hospitalName: hospital?.name ?? "Hospital",
      pin: item.pin ?? "----",
      requestBloodType: request?.blood_type ?? "-",
      responseId: item.id,
      status: normalizeStatus(item.status)
    } satisfies DonorPinResponse;
  });
}

async function resolvePublicUserIds(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  authUserId: string
) {
  const { data, error } = await db
    .from("users")
    .select("id")
    .or(`id.eq.${authUserId},auth_user_id.eq.${authUserId}`);
  if (error) throw supabaseError("Não foi possível identificar o utilizador", error);
  return [...new Set([authUserId, ...(data ?? []).map((item) => item.id)])];
}

function normalizeStatus(status?: string | null): DonorResponseStatus {
  const oldValues: Record<string, DonorResponseStatus> = {
    accepted: "Dador a Caminho",
    Aceite: "Dador a Caminho",
    arrived: "Chegou",
    cancelled: "Cancelado",
    Cancelado: "Cancelado",
    Chegou: "Chegou",
    completed: "Doação concluída",
    Concluido: "Doação concluída",
    "Concluído": "Doação concluída",
    "Doação concluída": "Doação concluída",
    no_show: "Não Compareceu",
    NO_SHOW: "Não Compareceu",
    "Não Compareceu": "Não Compareceu",
    "PIN Gerado": "Dador a Caminho",
    pin_validated: "PIN Validado",
    "PIN Validado": "PIN Validado",
    "Dador a Caminho": "Dador a Caminho"
  };
  return oldValues[status ?? ""] ?? "Dador a Caminho";
}

function isOldStatus(status?: string | null) {
  const normalized = normalizeStatus(status);
  return normalized === "Doação concluída" || normalized === "Cancelado" || normalized === "Não Compareceu";
}

function isActiveStatus(status?: string | null) {
  const normalized = normalizeStatus(status);
  return normalized === "Dador a Caminho" || normalized === "Chegou" || normalized === "PIN Validado";
}

function locationLabel(hospital?: { municipality?: string | null; province?: string | null } | null) {
  return [hospital?.municipality, hospital?.province].filter(Boolean).join(", ") || "Localização a confirmar";
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
