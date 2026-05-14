import { getBackendStatus, getNationalSummary } from "@doe-sangue-angola/shared-services";
import { Sidebar } from "./components/shell/Sidebar";

export default function HomePage() {
  const summary = getNationalSummary();
  const backend = getBackendStatus();

  return (
    <main className="app-shell">
      <Sidebar active="home" />
      <section className="workspace">
        <div className="panel">
          <div className="eyebrow">Plataforma conectada</div>
          <h1 className="title">Doe Sangue Angola</h1>
          <p className="muted" style={{ maxWidth: 680 }}>
            Um sistema premium para ligar hospitais, administradores nacionais e
            dadores num fluxo unico de pedidos, compatibilidade e notificacoes.
          </p>
          <div className="grid metrics" style={{ marginTop: 22 }}>
            <strong>{summary.hospitals} hospitais ligados</strong>
            <strong>{summary.activeRequests} pedidos ativos</strong>
            <strong>{summary.availableDonors} dadores disponiveis</strong>
            <strong>{summary.criticalRequests} pedidos criticos</strong>
          </div>
          <p className="pill gold" style={{ marginTop: 24 }}>
            Backend: {backend.message}
          </p>
        </div>
      </section>
    </main>
  );
}
