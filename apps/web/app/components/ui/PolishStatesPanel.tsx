import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ResponsiveGrid } from "./ResponsiveGrid";

export function PolishStatesPanel() {
  return (
    <section aria-label="Estados da plataforma">
      <ResponsiveGrid min={220}>
      <LoadingSkeleton label="Sincronização em curso" />
      <EmptyState
        title="Sem pendências"
        message="As filas críticas ficam calmas quando não há ações abertas."
      />
      <ErrorState
        title="Falha recuperável"
        message="Estados de erro estão prontos para integrações reais."
      />
      </ResponsiveGrid>
    </section>
  );
}
