"use client";

import { ErrorState } from "./components/ui/ErrorState";
import "./globals.css";
import "./theme.css";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return (
    <html lang="pt">
      <body>
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
              {[
                `Mensagem: ${error.message}`,
                error.stack ? `Stack:\n${error.stack}` : "",
                error.digest ? `Digest: ${error.digest}` : ""
              ].filter(Boolean).join("\n\n")}
            </pre>
          ) : null}
        </main>
      </body>
    </html>
  );
}
