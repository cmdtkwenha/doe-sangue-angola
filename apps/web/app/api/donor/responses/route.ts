import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { apiResponse } from "../../_utils/apiResponse";
import { distanceKm, etaMinutes } from "../../_utils/location";
import { createRouteSupabase, requireApiSession } from "../../_utils/security";

export type DonorPinResponse = {
  bloodRequestId: string;
  etaMinutes: number;
  hospitalLocation: string;
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
      .select("id,latitude,longitude")
      .eq("user_id", principal.authUserId)
      .maybeSingle();
    if (donorError) throw supabaseError("Não foi possível carregar o perfil de dador", donorError);
    if (!donor?.id) return [];

    const { data: responses, error } = await db
      .from("donor_responses")
      .select("blood_request_id,hospital_id,status,eta_minutes,confirmation_pin")
      .eq("donor_id", donor.id)
      .order("created_at", { ascending: false });
    if (error) throw supabaseError("Não foi possível carregar o PIN de doação", error);
    if (!responses?.length) return [];

    const hospitalIds = unique(responses.map((item) => item.hospital_id));
    const requestIds = unique(responses.map((item) => item.blood_request_id));
    const [{ data: hospitals, error: hospitalError }, { data: requests, error: requestError }] =
      await Promise.all([
        db.from("hospitals").select("id,name,municipality,province,latitude,longitude").in("id", hospitalIds),
        db.from("blood_requests").select("id,blood_type").in("id", requestIds)
      ]);
    if (hospitalError) throw supabaseError("Não foi possível carregar o hospital", hospitalError);
    if (requestError) throw supabaseError("Não foi possível carregar o pedido", requestError);

  return responses.map((item) => {
      const hospital = hospitals?.find((row) => row.id === item.hospital_id);
      const request = requests?.find((row) => row.id === item.blood_request_id);
      const distance = distanceKm(donor, hospital);
      return {
        bloodRequestId: item.blood_request_id,
        etaMinutes: etaMinutes(distance) ?? item.eta_minutes ?? 30,
        hospitalLocation: locationLabel(hospital),
        hospitalName: hospital?.name ?? "Hospital",
        pin: item.confirmation_pin ?? "----",
        requestBloodType: request?.blood_type ?? "-",
        status: normalizeStatus(item.status)
      } satisfies DonorPinResponse;
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
