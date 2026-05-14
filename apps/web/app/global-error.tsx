"use client";

import { ErrorState } from "./components/ui/ErrorState";
import "./globals.css";
import "./theme.css";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="pt">
      <body>
        <main style={{ padding: 24 }}>
          <ErrorState
            message="A plataforma encontrou uma falha geral. A equipa técnica será avisada."
            onRetry={reset}
            title="Estamos a recuperar a experiência"
          />
        </main>
      </body>
    </html>
  );
}
