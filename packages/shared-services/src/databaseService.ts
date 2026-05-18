import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type RuntimeGlobal = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

const env = (globalThis as RuntimeGlobal).process?.env ?? {};

let client: SupabaseClient | null = null;

export function getDatabaseConfig() {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL ?? env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey:
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    key: serviceRoleKey ??
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    serverMode: Boolean(serviceRoleKey)
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
