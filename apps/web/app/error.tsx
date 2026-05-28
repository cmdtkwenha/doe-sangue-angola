"use client";

import { ErrorState } from "./components/ui/ErrorState";
import { reportError } from "@doe-sangue-angola/shared-services";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const details = [
    `Mensagem: ${error.message}`,
    error.stack ? `Stack:\n${error.stack}` : "",
    error.digest ? `Digest: ${error.digest}` : ""
  ].filter(Boolean).join("\n\n");

  if (isDevelopment) {
    console.error("Erro de rota", {
      digest: error.digest,
      message: error.message,
      stack: error.stack
    });
  }
  reportError(error, { feature: "frontend.route_error" });

  return (
    <main style={{ padding: 24 }}>
      <ErrorState
        message="Perfil ainda não configurado."
        onRetry={reset}
        title="Não foi possível carregar esta área"
      />
      {isDevelopment ? (
        <pre style={{
          background: "#111827",
          borderRadius: 12,
          color: "#f8fafc",
          marginTop: 16,
          overflow: "auto",
          padding: 16,
          whiteSpace: "pre-wrap"
        }}>
          {details || "Sem detalhes adicionais."}
        </pre>
      ) : null}
    </main>
  );
}
