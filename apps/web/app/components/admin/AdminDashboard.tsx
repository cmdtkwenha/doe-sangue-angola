import dynamic from "next/dynamic";
import styles from "./adminCore.module.css";
import { AdminHeader } from "./AdminHeader";
import { AdminMetrics } from "./AdminMetrics";
import { AdminSidebar } from "./AdminSidebar";
import { BloodInventoryTable } from "./BloodInventoryTable";
import { LiveRequestsPanel } from "./LiveRequestsPanel";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { ProvinceHeatMap } from "./ProvinceHeatMap";
import { RealtimeStatusStrip } from "../realtime/RealtimeStatusStrip";

const AdvancedMonitoring = dynamic(() =>
  import("./AdvancedMonitoring").then((module) => module.AdvancedMonitoring),
{ loading: () => <LoadingSkeleton label="A carregar monitorização avançada" /> });
const AnalyticsGrid = dynamic(() =>
  import("../analytics/AnalyticsGrid").then((module) => module.AnalyticsGrid),
{ loading: () => <LoadingSkeleton label="A preparar analítica nacional" /> });
const AuditTrailPanel = dynamic(() =>
  import("../workflow/AuditTrailPanel").then((module) => module.AuditTrailPanel),
{ loading: () => <LoadingSkeleton label="A carregar trilho de auditoria" /> });
const DemoTimeline = dynamic(() =>
  import("../demo/DemoTimeline").then((module) => module.DemoTimeline),
{ loading: () => <LoadingSkeleton label="A preparar modo apresentação" /> });
const FounderDashboard = dynamic(() =>
  import("../founder").then((module) => module.FounderDashboard),
{ loading: () => <LoadingSkeleton label="A carregar ferramentas do fundador" /> });
const PolishStatesPanel = dynamic(() =>
  import("../ui/PolishStatesPanel").then((module) => module.PolishStatesPanel),
{ loading: () => <LoadingSkeleton label="A carregar estados da plataforma" /> });
const MonitoringDashboard = dynamic(() =>
  import("../monitoring").then((module) => module.MonitoringDashboard),
{ loading: () => <LoadingSkeleton label="A carregar monitorização de produção" /> });
const ProductionMigrationChecklist = dynamic(() =>
  import("../migration").then((module) => module.ProductionMigrationChecklist),
{ loading: () => <LoadingSkeleton label="A preparar checklist de migração" /> });
const PilotModeBanner = dynamic(() =>
  import("../pilot").then((module) => module.PilotModeBanner),
{ loading: () => <LoadingSkeleton label="A carregar modo piloto" /> });
const PilotAnalyticsPanel = dynamic(() =>
  import("../pilot").then((module) => module.PilotAnalyticsPanel),
{ loading: () => <LoadingSkeleton label="A preparar analytics piloto" /> });
const TestAccountsSeeder = dynamic(() =>
  import("../pilot").then((module) => module.TestAccountsSeeder),
{ loading: () => <LoadingSkeleton label="A preparar contas piloto" /> });
const RequestStatusTimeline = dynamic(() =>
  import("../workflow/RequestStatusTimeline").then((module) => module.RequestStatusTimeline),
{ loading: () => <LoadingSkeleton label="A sincronizar fluxo de pedidos" /> });
const VerificationGrid = dynamic(() =>
  import("../verification").then((module) => module.VerificationGrid),
{ loading: () => <LoadingSkeleton label="A verificar saúde do sistema" /> });

export function AdminDashboard() {
  return (
    <main className={styles.shell}>
      <AdminSidebar />
      <section className={styles.content}>
        <AdminHeader />
        <div className={styles.workspace}>
          <PilotModeBanner />
          <RealtimeStatusStrip />
          <FounderDashboard />
          <VerificationGrid />
          <DemoTimeline />
          <RequestStatusTimeline />
          <AdminMetrics />
          <section className={styles.mainGrid}>
            <ProvinceHeatMap />
            <LiveRequestsPanel />
          </section>
          <section className={styles.bottomGrid}>
            <BloodInventoryTable />
          </section>
          <AnalyticsGrid scope="admin" />
          <section className={styles.mainGrid}>
            <PilotAnalyticsPanel />
            <TestAccountsSeeder />
          </section>
          <MonitoringDashboard />
          <ProductionMigrationChecklist />
          <AuditTrailPanel />
          <PolishStatesPanel />
          <AdvancedMonitoring />
        </div>
      </section>
    </main>
  );
}
