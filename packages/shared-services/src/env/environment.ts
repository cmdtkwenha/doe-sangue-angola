import type { AuthMode, DataMode } from "../config";

export type EnvironmentMode = "development" | "staging" | "production";

export type EnvironmentConfig = {
  mode: EnvironmentMode;
  label: string;
  dataMode: DataMode;
  authMode: AuthMode;
  appUrl: string;
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  pilotMode: boolean;
  safeNotifications: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  monitoringEnabled: boolean;
};

const runtimeEnv = () => process.env;

const read = (
  env: Record<string, string | undefined>,
  names: string[],
  fallback = ""
) => names.map((name) => env[name]).find(Boolean) ?? fallback;

const modeFrom = (value: string): EnvironmentMode => {
  if (value === "staging" || value === "production") return value;
  return "development";
};

const dataModeFrom = (value: string): DataMode =>
  value === "supabase" ? "supabase" : "mock";

const authModeFrom = (value: string): AuthMode =>
  value === "supabase" ? "supabase" : "demo";

const boolFrom = (value: string, fallback: boolean) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const logLevelFrom = (value: string): EnvironmentConfig["logLevel"] => {
  if (value === "debug" || value === "warn" || value === "error") return value;
  return "info";
};

export function loadEnvironment(
  env: Record<string, string | undefined> = runtimeEnv()
): EnvironmentConfig {
  const mode = modeFrom(read(env, ["NEXT_PUBLIC_APP_ENV", "EXPO_PUBLIC_APP_ENV"], "development"));
  const siteUrl = read(env, ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_APP_URL"], "http://localhost:3000");

  return {
    mode,
    label: mode === "production" ? "Produção" : mode === "staging" ? "Staging" : "Desenvolvimento",
    dataMode: dataModeFrom(read(env, ["NEXT_PUBLIC_DATA_MODE"], "mock")),
    authMode: authModeFrom(read(env, ["NEXT_PUBLIC_AUTH_MODE"], "demo")),
    appUrl: siteUrl,
    apiUrl: read(env, ["EXPO_PUBLIC_API_URL", "NEXT_PUBLIC_API_URL"], siteUrl),
    supabaseUrl: read(env, ["NEXT_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_URL"]),
    supabaseAnonKey: read(env, ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "EXPO_PUBLIC_SUPABASE_ANON_KEY"]),
    pilotMode: boolFrom(read(env, ["NEXT_PUBLIC_PILOT_MODE", "EXPO_PUBLIC_PILOT_MODE"]), false),
    safeNotifications: boolFrom(
      read(env, ["NEXT_PUBLIC_PILOT_SAFE_NOTIFICATIONS", "EXPO_PUBLIC_PILOT_SAFE_NOTIFICATIONS"]),
      true
    ),
    logLevel: logLevelFrom(read(env, ["NEXT_PUBLIC_LOG_LEVEL", "EXPO_PUBLIC_LOG_LEVEL"], "info")),
    monitoringEnabled: boolFrom(read(env, ["NEXT_PUBLIC_MONITORING_ENABLED"]), mode === "production")
  };
}

export const environment = loadEnvironment();

export const isSupabaseReady = (config: EnvironmentConfig = environment) =>
  Boolean(config.supabaseUrl && config.supabaseAnonKey);
