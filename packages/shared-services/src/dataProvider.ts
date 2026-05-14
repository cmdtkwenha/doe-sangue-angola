import { getDataMode } from "./config";
import { isDatabaseConfigured } from "./databaseService";
import { mockProvider } from "./mockProvider";
import { supabaseProvider } from "./supabaseProvider";

export function getDataProvider() {
  const mode = getDataMode();

  // TODO(production): change NEXT_PUBLIC_DATA_MODE to "supabase" only after real queries exist.
  return mode === "supabase" ? supabaseProvider : mockProvider;
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
