import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";

type CancelBody = { responseId?: string };

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<CancelBody>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const db = await createRouteSupabase();
    const responseId = body.responseId?.trim();
    if (!responseId) throw new ApiError(400, "Resposta do dador em falta.");

    const userIds = await resolvePublicUserIds(db, principal.authUserId);
    const { data: donor, error: donorError } = await db
      .from("donors")
      .select("id")
      .in("user_id", userIds)
      .maybeSingle();
    if (donorError) throw supabaseError("Não foi possível confirmar o dador", donorError);

    let { data: existing, error } = await db
      .from("donor_responses")
      .select("id,blood_request_id,donor_id,status")
      .eq("id", responseId)
      .maybeSingle();
    if (error) throw supabaseError("Não foi possível carregar a aceitação", error);
    let source: "donor_responses" | "request_acceptances" = "donor_responses";
    if (!existing) {
      existing = await loadAcceptance(db, responseId);
      source = "request_acceptances";
    }
    if (!existing) throw new ApiError(404, "Aceitação não encontrada.");
    if (principal.role !== "admin" && existing.donor_id !== donor?.id) {
      throw new ApiError(403, "Só pode cancelar a sua própria aceitação.");
    }
    if (["Doação concluída", "Cancelado", "Não Compareceu", "completed", "cancelled", "no_show"].includes(existing.status ?? "")) {
      throw new ApiError(409, "Esta aceitação já não pode ser cancelada.");
    }

    const now = new Date().toISOString();
    if (source === "donor_responses") {
      const { error: updateError } = await db
        .from("donor_responses")
        .update({ cancelled_at: now, status: "Cancelado" })
        .eq("id", responseId);
      if (updateError) throw supabaseError("Não foi possível cancelar a aceitação", updateError);
    }

    await db.from("request_acceptances")
      .update({ cancelled_at: now, status: "Cancelado", updated_at: now })
      .eq("request_id", existing.blood_request_id)
      .eq("donor_id", existing.donor_id);

    const { error: quotaError } = await db.rpc("recompute_request_quota", {
      p_request_id: existing.blood_request_id
    });
    if (quotaError) throw supabaseError("Não foi possível reabrir a vaga do pedido", quotaError);

    await auditApiAction(principal, `Dador cancelou aceitação ${responseId}. Pedido reaberto ${existing.blood_request_id}.`);
    return { responseId, status: "Cancelado" };
  });
}

function supabaseError(label: string, error: { message: string }) {
  return new Error(`${label}. ${error.message}`);
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

async function loadAcceptance(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  responseId: string
) {
  const { data, error } = await db
    .from("request_acceptances")
    .select("id,request_id,donor_id,status")
    .eq("id", responseId)
    .maybeSingle();
  if (error) throw supabaseError("Não foi possível carregar a aceitação do pedido", error);
  if (!data) return null;
  return {
    blood_request_id: data.request_id,
    donor_id: data.donor_id,
    id: data.id,
    status: data.status
  };
}
