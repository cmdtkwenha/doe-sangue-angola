import { dataProvider, getBackendStatus, isDatabaseConfigured } from "@doe-sangue-angola/shared-services";
import type { BloodRequest, Donor, Hospital } from "@doe-sangue-angola/shared-types";
import { Sidebar } from "./components/shell/Sidebar";

export default async function HomePage() {
  const backend = getBackendStatus();
  const summary = await loadRealSummary();

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
          {summary.error ? (
            <p className="pill red" style={{ marginTop: 12 }}>
              {summary.error}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

async function loadRealSummary() {
  if (!isDatabaseConfigured()) {
    return {
      activeRequests: "-",
      availableDonors: "-",
      criticalRequests: "-",
      hospitals: "-"
    };
  }
  try {
    const [hospitals, donors, requests] = await Promise.all([
      dataProvider.listHospitals(),
      dataProvider.listDonors(),
      dataProvider.listRequests()
    ]) as [Hospital[], Donor[], BloodRequest[]];
    const active = requests.filter((request) => !["Cancelado", "Concluído"].includes(request.status));
    return {
      activeRequests: active.length,
      availableDonors: donors.filter((donor) => donor.available).length,
      criticalRequests: active.filter((request) => request.urgency === "Critica").length,
      hospitals: hospitals.filter((hospital) => hospital.verified).length
    };
  } catch {
    return {
      activeRequests: "-",
      availableDonors: "-",
      criticalRequests: "-",
      error: "Configuração da base de dados incompleta. Aplique as migrações Supabase mais recentes.",
      hospitals: "-"
    };
  }
}
