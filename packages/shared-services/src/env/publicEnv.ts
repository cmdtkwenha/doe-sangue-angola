import { environment, isSupabaseReady } from "./environment";

export const publicEnv = {
  dataMode: environment.dataMode,
  authMode: environment.authMode,
  supabaseUrl: environment.supabaseUrl,
  supabaseAnonKey: environment.supabaseAnonKey,
  appEnv: environment.mode,
  appUrl: environment.appUrl,
  apiUrl: environment.apiUrl,
  pilotMode: environment.pilotMode,
  safeNotifications: environment.safeNotifications
} as const;

export const isSupabaseConfigured = () => isSupabaseReady(environment);
