import { ApiError } from "./apiResponse";
import type { createRouteSupabase } from "./security";

type Db = Awaited<ReturnType<typeof createRouteSupabase>>;

export async function assertTableRateLimit(
  db: Db,
  input: {
    column: string;
    label: string;
    max: number;
    minutes: number;
    table: string;
    value: string;
  }
) {
  const since = new Date(Date.now() - input.minutes * 60 * 1000).toISOString();
  const { count, error } = await db
    .from(input.table)
    .select("*", { count: "exact", head: true })
    .eq(input.column, input.value)
    .gte("created_at", since);
  if (error) throw new Error(`Não foi possível verificar limite de segurança. ${error.message}`);
  if ((count ?? 0) >= input.max) {
    throw new ApiError(429, `${input.label}. Aguarde alguns minutos antes de tentar novamente.`);
  }
}
