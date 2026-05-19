export type DataMode = "mock" | "supabase";
export type AuthMode = "demo" | "supabase";
export type PushMode = "mock" | "expo";

const readPublicEnv = (value: string | undefined) => value?.trim().toLowerCase();

export function getDataMode(): DataMode {
  const value = readPublicEnv(process.env.NEXT_PUBLIC_DATA_MODE);

  return value === "supabase" ? "supabase" : "mock";
}

export function isSupabaseMode() {
  return getDataMode() === "supabase";
}

export function getAuthMode(): AuthMode {
  const value = readPublicEnv(process.env.NEXT_PUBLIC_AUTH_MODE);

  return value === "supabase" ? "supabase" : "demo";
}

export function getPushMode(): PushMode {
  const value = readPublicEnv(process.env.NEXT_PUBLIC_PUSH_MODE ?? process.env.EXPO_PUBLIC_PUSH_MODE);

  return value === "expo" ? "expo" : "mock";
}
