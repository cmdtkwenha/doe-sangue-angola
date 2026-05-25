import { dataProvider } from "@doe-sangue-angola/shared-services";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ donorId: string; requestId: string }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const donorId = assertString(body.donorId, "Dador");
    const db = await createRouteSupabase();
    const { data: donor, error } = await db
      .from("donors")
      .select("id,user_id")
      .eq("id", donorId)
      .maybeSingle();
    if (error) throw error;
    const donorRow = donor as unknown as { id: string; user_id?: string } | null;
    if (!donorRow?.id) throw new ApiError(404, "Perfil de dador não encontrado.");
    if (
      principal.role !== "admin" &&
      donorRow.user_id !== principal.authUserId &&
      principal.donorId !== donorId
    ) {
      throw new ApiError(403, "Acesso negado a este dador.");
    }
    const appointment = await dataProvider.acceptRequest(
      donorId,
      assertString(body.requestId, "Pedido")
    );
    await auditApiAction(principal, `Aceitou pedido de sangue ${body.requestId}.`);
    return appointment;
  });
}
