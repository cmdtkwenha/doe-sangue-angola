import { getDataMode } from "./config";
import { isDatabaseConfigured } from "./databaseService";
import { mockProvider } from "./mockProvider";
import { supabaseProvider } from "./supabaseProvider";

export function getDataProvider() {
  const mode = getDataMode();
  const production = process.env.NODE_ENV === "production";

  return (mode === "supabase" || production) && isDatabaseConfigured()
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
      mode === "mock" && process.env.NODE_ENV !== "production"
        ? "A usar mockProvider."
        : databaseReady
          ? "A usar Supabase database."
          : "Supabase selecionado, mas variáveis públicas em falta."
  };
}
