import type { createRouteSupabase } from "../_utils/security";

type Db = Awaited<ReturnType<typeof createRouteSupabase>>;

export async function acceptedRequestIds(db: Db, donorId: string) {
  const statuses = ["Dador a Caminho", "PIN Gerado", "PIN Validado", "Chegou"];
  const [{ data: responses, error: responseError }, { data: acceptances, error: acceptanceError }] =
    await Promise.all([
      db.from("donor_responses")
        .select("blood_request_id")
        .eq("donor_id", donorId)
        .in("status", statuses),
      db.from("request_acceptances")
        .select("request_id")
        .eq("donor_id", donorId)
        .in("status", statuses)
    ]);
  if (responseError) throw new Error(responseError.message);
  if (acceptanceError) throw new Error(acceptanceError.message);
  return new Set([
    ...((responses ?? []).map((item) => item.blood_request_id).filter(Boolean)),
    ...((acceptances ?? []).map((item) => item.request_id).filter(Boolean))
  ]);
}
