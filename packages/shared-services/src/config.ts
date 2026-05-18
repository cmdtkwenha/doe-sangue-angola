export type DataMode = "mock" | "supabase";
export type AuthMode = "demo" | "supabase";
export type PushMode = "mock" | "expo";

type RuntimeGlobal = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

const env = (globalThis as RuntimeGlobal).process?.env ?? {};

export function getDataMode(): DataMode {
  const value = env.NEXT_PUBLIC_DATA_MODE ?? env.EXPO_PUBLIC_DATA_MODE;

  // Mock is the safe default for demos, tests, and offline development.
  return value === "supabase" ? "supabase" : "mock";
}

export function isSupabaseMode() {
  return getDataMode() === "supabase";
}

export function getAuthMode(): AuthMode {
  const value = env.NEXT_PUBLIC_AUTH_MODE ?? env.EXPO_PUBLIC_AUTH_MODE;

  return value === "supabase" ? "supabase" : "demo";
}

export function getPushMode(): PushMode {
  const value = env.NEXT_PUBLIC_PUSH_MODE ?? env.EXPO_PUBLIC_PUSH_MODE;

  return value === "expo" ? "expo" : "mock";
}
