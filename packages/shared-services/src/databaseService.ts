import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getDatabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    serverMode: false
  };
}

export function isDatabaseConfigured() {
  const config = getDatabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export function getDatabaseClient() {
  const config = getDatabaseConfig();
  if (!config.url || !config.key) {
    throw new Error("Supabase não configurado. Verifique as variáveis públicas.");
  }

  client ??= createClient(config.url, config.key, {
    auth: { persistSession: !config.serverMode }
  });
  return client;
}

export async function safeQuery<T>(fn: (db: SupabaseClient) => Promise<T>) {
  try {
    return { ok: true as const, data: await fn(getDatabaseClient()) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro Supabase"
    };
  }
}

export async function checkDatabaseHealth() {
  if (!isDatabaseConfigured()) {
    return {
      ok: false as const,
      mode: "not-configured" as const,
      message: "Supabase não configurado. Verifique as variáveis de ambiente."
    };
  }

  try {
    const { error } = await getDatabaseClient()
      .from("users")
      .select("id", { count: "exact", head: true });

    if (error) throw error;
    return {
      ok: true as const,
      mode: "supabase" as const,
      message: "Ligação Supabase ativa."
    };
  } catch (error) {
    return {
      ok: false as const,
      mode: "supabase-error" as const,
      message: error instanceof Error
        ? error.message
        : "Falha ao verificar Supabase."
    };
  }
}
