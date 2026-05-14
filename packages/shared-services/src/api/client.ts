import { reportError } from "../logger";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; recoverable: boolean; status?: number };

const friendlyMessage = (fallback: string, status?: number) => {
  if (!status) return "Sem ligação. Verifique a internet e tente novamente.";
  if (status >= 500) return "Serviço temporariamente indisponível. Tente novamente.";
  if (status === 401 || status === 403) return "Sessão sem permissão para esta ação.";
  return fallback || "Não foi possível concluir o pedido.";
};

export const createApiClient = (baseUrl = "") => ({
  async get<T>(path: string): Promise<ApiResult<T>> {
    try {
      const response = await fetch(`${baseUrl}${path}`);
      if (!response.ok) {
        return {
          ok: false,
          message: friendlyMessage(response.statusText, response.status),
          recoverable: response.status >= 500,
          status: response.status
        };
      }
      return { ok: true, data: (await response.json()) as T };
    } catch (error) {
      reportError(error, { feature: "api.get", metadata: { path } });
      return {
        ok: false,
        message: friendlyMessage("Falha de comunicação"),
        recoverable: true
      };
    }
  },

  async post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        return {
          ok: false,
          message: friendlyMessage(response.statusText, response.status),
          recoverable: response.status >= 500,
          status: response.status
        };
      }
      return { ok: true, data: (await response.json()) as T };
    } catch (error) {
      reportError(error, { feature: "api.post", metadata: { path } });
      return {
        ok: false,
        message: friendlyMessage("Falha ao enviar dados"),
        recoverable: true
      };
    }
  }
});
