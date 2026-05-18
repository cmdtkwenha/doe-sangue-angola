import { getDataProviderStatus } from "./dataProvider";

type BackendMode = "mock" | "supabase";

export function getBackendMode(): BackendMode {
  return getDataProviderStatus().mode;
}

export function getBackendStatus() {
  const status = getDataProviderStatus();

  return {
    mode: status.mode,
    ready: status.ready,
    message: status.message
  };
}
