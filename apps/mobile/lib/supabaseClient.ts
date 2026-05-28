import { createClient } from "@supabase/supabase-js";

declare const process: {
  env: Record<string, string | undefined>;
};

type SupabaseConfig = {
  anonKey?: string;
  url?: string;
};

export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  };
}

export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export function getSupabaseClientStatus() {
  const production = process.env.EXPO_PUBLIC_APP_ENV === "production";
  return {
    mode: isSupabaseConfigured() ? "supabase-ready" : production ? "missing-config" : "mock",
    message: isSupabaseConfigured()
      ? "Variáveis Expo Supabase configuradas; cliente real pode ser ativado."
      : production
        ? "Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY."
      : "A usar serviços mockados."
  };
}

export function createSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config.url || !config.anonKey) {
    throw new Error("Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(config.url, config.anonKey);
}
