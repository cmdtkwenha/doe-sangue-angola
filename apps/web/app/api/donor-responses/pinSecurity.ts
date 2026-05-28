import { ApiError } from "../_utils/apiResponse";
import { auditApiAction } from "../_utils/audit";
import type { createRouteSupabase, requireApiSession } from "../_utils/security";

type Db = Awaited<ReturnType<typeof createRouteSupabase>>;
type Principal = Awaited<ReturnType<typeof requireApiSession>>;

export function assertPinRate(existing: {
  failed_pin_attempts?: number | null;
  pin_locked_until?: string | null;
}) {
  if (existing.pin_locked_until && new Date(existing.pin_locked_until).getTime() > Date.now()) {
    throw new ApiError(429, "PIN bloqueado temporariamente por tentativas falhadas.");
  }
  if ((existing.failed_pin_attempts ?? 0) >= 5) {
    throw new ApiError(429, "Muitas tentativas de PIN. Aguarde antes de tentar novamente.");
  }
}

export async function recordFailedPin(db: Db, principal: Principal, responseId: string) {
  const locked = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const { data } = await db
    .from("donor_responses")
    .select("failed_pin_attempts")
    .eq("id", responseId)
    .maybeSingle();
  const attempts = (data?.failed_pin_attempts ?? 0) + 1;
  await db.from("donor_responses").update({
    failed_pin_attempts: attempts,
    last_pin_attempt_at: new Date().toISOString(),
    pin_locked_until: attempts >= 5 ? locked : null
  }).eq("id", responseId);
  await auditApiAction(principal, `Tentativa falhada de PIN (${responseId}).`);
}

export async function clearPinFailures(db: Db, responseId: string) {
  await db.from("donor_responses").update({
    failed_pin_attempts: 0,
    pin_locked_until: null
  }).eq("id", responseId);
}
