type BackendMode = "mock" | "supabase";

export function getBackendMode(): BackendMode {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ? "supabase" : "mock";
}

export function getBackendStatus() {
  const mode = getBackendMode();

  return {
    mode,
    ready: mode === "mock",
    message:
      mode === "mock"
        ? "A usar dados mockados."
        : "Supabase configurado para ligacao real."
  };
}
