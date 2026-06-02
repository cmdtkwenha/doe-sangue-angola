import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";
import { assertString, optionalString } from "../../_utils/validation";

type Action = "approve" | "reject" | "suspend" | "reactivate";
type Body = { action: Action; hospitalId: string; reason?: string };

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<Body>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const hospitalId = assertString(body.hospitalId, "Hospital");
    const action = assertAction(body.action);
    const patch = verificationPatch(action, body.reason);
    const db = await createRouteSupabase();
    const { data, error } = await db
      .from("hospitals")
      .update(patch)
      .eq("id", hospitalId)
      .select("id,name,verification_status,rejection_reason,verified")
      .single();
    if (error) throw new Error(error.message);
    await auditApiAction(principal, auditMessage(action, data.name, body.reason));
    return data;
  });
}

function assertAction(action?: string): Action {
  if (action === "approve" || action === "reject" || action === "suspend" || action === "reactivate") return action;
  throw new ApiError(400, "Ação inválida.");
}

function verificationPatch(action: Action, reason?: string) {
  if (action === "approve" || action === "reactivate") {
    return { rejection_reason: null, verification_status: "Verificado", verified: true };
  }
  if (action === "reject") {
    const text = optionalString(reason, 240);
    if (!text) throw new ApiError(400, "Informe o motivo da rejeição.");
    return { rejection_reason: text, verification_status: "Rejeitado", verified: false };
  }
  if (action === "suspend") {
    return {
      rejection_reason: optionalString(reason, 240) ?? "Conta suspensa pelo administrador.",
      verification_status: "Suspenso",
      verified: false
    };
  }
  throw new ApiError(400, "Ação inválida.");
}

function auditMessage(action: Action, hospital: string, reason?: string) {
  const labels: Record<Action, string> = {
    approve: "aprovou",
    reactivate: "reativou",
    reject: "rejeitou",
    suspend: "suspendeu"
  };
  const detail = reason ? ` Motivo: ${reason}.` : "";
  return `Admin ${labels[action]} hospital ${hospital}.${detail}`;
}
