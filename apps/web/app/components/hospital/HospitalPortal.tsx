import dynamic from "next/dynamic";
import styles from "./hospitalPortal.module.css";
import { ActiveRequestsTable } from "./ActiveRequestsTable";
import { AppointmentSchedule } from "./AppointmentSchedule";
import advanced from "./hospitalAdvanced.module.css";
import { HospitalHeader } from "./HospitalHeader";
import { HospitalSidebar } from "./HospitalSidebar";
import { HospitalSummaryCards } from "./HospitalSummaryCards";
import { IncomingDonorsList } from "./IncomingDonorsList";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { UrgentRequestCard } from "./UrgentRequestCard";

const load = (label: string) => () => <LoadingSkeleton label={label} />;
const AnalyticsGrid = dynamic(() =>
  import("../analytics/AnalyticsGrid").then((module) => module.AnalyticsGrid),
{ loading: load("A preparar analítica hospitalar") });
const AuditHistoryPanel = dynamic(() =>
  import("./AuditHistoryPanel").then((module) => module.AuditHistoryPanel),
{ loading: load("A carregar auditoria hospitalar") });
const AuditTrailPanel = dynamic(() =>
  import("../workflow/AuditTrailPanel").then((module) => module.AuditTrailPanel),
{ loading: load("A carregar trilho de auditoria") });
const CommunicationsPanel = dynamic(() =>
  import("./CommunicationsPanel").then((module) => module.CommunicationsPanel),
{ loading: load("A carregar comunicações") });
const DonorArrivalCard = dynamic(() =>
  import("./DonorArrivalCard").then((module) => module.DonorArrivalCard),
{ loading: load("A carregar confirmações de chegada") });
const ExpiringUnitsPanel = dynamic(() =>
  import("./ExpiringUnitsPanel").then((module) => module.ExpiringUnitsPanel),
{ loading: load("A carregar unidades a vencer") });
const HospitalPerformancePanel = dynamic(() =>
  import("./HospitalPerformancePanel").then((module) => module.HospitalPerformancePanel),
{ loading: load("A carregar desempenho hospitalar") });
const InventoryPanel = dynamic(() =>
  import("./InventoryPanel").then((module) => module.InventoryPanel),
{ loading: load("A carregar inventário") });
const PinValidationCard = dynamic(() =>
  import("./PinValidationCard").then((module) => module.PinValidationCard),
{ loading: load("A preparar validação PIN") });
const PolishStatesPanel = dynamic(() =>
  import("../ui/PolishStatesPanel").then((module) => module.PolishStatesPanel),
{ loading: load("A carregar estados da plataforma") });
const QuickActionsPanel = dynamic(() =>
  import("./QuickActionsPanel").then((module) => module.QuickActionsPanel),
{ loading: load("A carregar ações rápidas") });
const RegionAlerts = dynamic(() =>
  import("./RegionAlerts").then((module) => module.RegionAlerts),
{ loading: load("A carregar alertas regionais") });
const AppointmentConfirmation = dynamic(() =>
  import("./automation/AppointmentConfirmation").then((module) => module.AppointmentConfirmation),
{ loading: load("A preparar confirmação de agendamento") });
const CompletionFlow = dynamic(() =>
  import("../workflow/CompletionFlow").then((module) => module.CompletionFlow),
{ loading: load("A preparar conclusão de doação") });
const ConfirmationFlow = dynamic(() =>
  import("./automation/ConfirmationFlow").then((module) => module.ConfirmationFlow),
{ loading: load("A carregar confirmação de dador") });
const ExpirationAlerts = dynamic(() =>
  import("./automation/ExpirationAlerts").then((module) => module.ExpirationAlerts),
{ loading: load("A carregar alertas de validade") });
const InventoryUpdater = dynamic(() =>
  import("./automation/InventoryUpdater").then((module) => module.InventoryUpdater),
{ loading: load("A preparar atualização de inventário") });
const PinValidationFlow = dynamic(() =>
  import("../workflow/PinValidationFlow").then((module) => module.PinValidationFlow),
{ loading: load("A preparar validação do PIN") });
const RequestCompletionPanel = dynamic(() =>
  import("./automation/RequestCompletionPanel").then((module) => module.RequestCompletionPanel),
{ loading: load("A carregar conclusão do pedido") });
const RequestStatusTimeline = dynamic(() =>
  import("../workflow/RequestStatusTimeline").then((module) => module.RequestStatusTimeline),
{ loading: load("A sincronizar estado do pedido") });
const RequestWizard = dynamic(() =>
  import("./automation/RequestWizard").then((module) => module.RequestWizard),
{ loading: load("A preparar criação de pedido") });

export function HospitalPortal() {
  return (
    <main className={styles.portal}>
      <HospitalSidebar />
      <section className={styles.content}>
        <HospitalHeader />
        <div className={styles.workspace}>
          <section className={styles.topGrid}>
            <UrgentRequestCard />
            <HospitalSummaryCards />
          </section>
          <section className={styles.grid3}>
            <ActiveRequestsTable />
            <IncomingDonorsList />
            <AppointmentSchedule />
          </section>
          <section className={advanced.balancedGrid}>
            <RequestWizard />
            <ConfirmationFlow />
            <AppointmentConfirmation />
          </section>
          <section className={advanced.balancedGrid}>
            <RequestCompletionPanel />
            <InventoryUpdater />
            <ExpirationAlerts />
          </section>
          <section className={advanced.balancedGrid}>
            <RequestStatusTimeline />
            <PinValidationFlow />
            <CompletionFlow />
          </section>
          <section className={advanced.advancedGrid}>
            <PinValidationCard />
            <HospitalPerformancePanel />
            <DonorArrivalCard />
          </section>
          <section className={advanced.balancedGrid}>
            <RegionAlerts />
            <ExpiringUnitsPanel />
            <CommunicationsPanel />
          </section>
          <section className={advanced.balancedGrid}>
            <InventoryPanel />
            <QuickActionsPanel />
            <AuditHistoryPanel />
          </section>
          <AnalyticsGrid scope="hospital" />
          <AuditTrailPanel />
          <PolishStatesPanel />
        </div>
      </section>
    </main>
  );
}
