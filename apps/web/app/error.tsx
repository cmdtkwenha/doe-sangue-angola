"use client";

import { ErrorState } from "./components/ui/ErrorState";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Erro de rota", error);

  return (
    <main style={{ padding: 24 }}>
      <ErrorState
        message="Algo falhou ao abrir esta página. Pode tentar novamente sem perder o contexto."
        onRetry={reset}
        title="Página temporariamente indisponível"
      />
    </main>
  );
}
