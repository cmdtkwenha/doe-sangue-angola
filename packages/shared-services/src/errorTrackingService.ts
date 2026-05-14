import { listErrorLogs, monitoringService } from "./monitoringService";

export function errorTrackingService(
  error: unknown,
  metadata?: Record<string, string | number | boolean>
) {
  const message = error instanceof Error ? error.message : "Erro inesperado";

  // Future path: forward this record to Sentry, Logtail, Datadog, or Supabase logs.
  return monitoringService({
    message,
    metadata,
    status: "error",
    type: "ERROR"
  });
}

export function listTrackedErrors() {
  return listErrorLogs();
}
