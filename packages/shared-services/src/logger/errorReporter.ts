import type { LogContext } from "./types";
import { errorTrackingService } from "../errorTrackingService";

export const reportError = (
  error: unknown,
  context: LogContext = { feature: "unknown" }
) => {
  const message = error instanceof Error ? error.message : "Erro inesperado";

  // Later: send this entry to Sentry, Supabase logs, or a hospital audit table.
  return errorTrackingService(message, context.metadata);
};
