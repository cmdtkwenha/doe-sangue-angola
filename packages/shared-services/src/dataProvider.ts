import { getDataMode } from "./config";
import { isDatabaseConfigured } from "./databaseService";
import { mockProvider } from "./mockProvider";
import { supabaseProvider } from "./supabaseProvider";

export function getDataProvider() {
  const mode = getDataMode();

  return mode === "supabase" && isDatabaseConfigured()
    ? supabaseProvider
    : mockProvider;
}

export const dataProvider = getDataProvider();

export function getDataProviderStatus() {
  const mode = getDataMode();
  const databaseReady = isDatabaseConfigured();

  return {
    mode,
    ready: mode === "mock" || databaseReady,
    message:
      mode === "mock"
        ? "A usar mockProvider."
        : databaseReady
          ? "A usar Supabase database."
          : "Supabase selecionado, mas variáveis públicas em falta."
  };
}
