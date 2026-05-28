import { trackFailedAction } from "./monitoringService";

export type RetryOptions = {
  attempts?: number;
  delayMs?: number;
  label: string;
};

export async function withRetry<T>(
  action: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const attempts = options.attempts ?? 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(options.delayMs ?? 350);
    }
  }

  trackFailedAction(`Falha após retry: ${options.label}`, {
    attempts,
    error: lastError instanceof Error ? lastError.message : "erro desconhecido"
  });
  throw lastError;
}

export function getOfflineState() {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return {
    message: offline
      ? "Sem ligação. Os dados serão sincronizados quando a internet voltar."
      : "Ligação ativa.",
    offline
  };
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
