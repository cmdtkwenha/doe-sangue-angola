import dynamic from "next/dynamic";
import styles from "./hospitalPortal.module.css";
import { ActiveRequestsTable } from "./ActiveRequestsTable";
import { AppointmentSchedule } from "./AppointmentSchedule";
import advanced from "./hospitalAdvanced.module.css";
import { HospitalEntityGate } from "./HospitalEntityGate";
import { HospitalHeader } from "./HospitalHeader";
import { HospitalSidebar } from "./HospitalSidebar";
import { HospitalSummaryCards } from "./HospitalSummaryCards";
import { IncomingDonorsList } from "./IncomingDonorsList";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { UrgentRequestCard } from "./UrgentRequestCard";

const load = (label: string) => () => <LoadingSkeleton label={label} />;
const AuditHistoryPanel = dynamic(() =>
  import("./AuditHistoryPanel").then((module) => module.AuditHistoryPanel),
{ loading: load("A carregar auditoria hospitalar") });
const CommunicationsPanel = dynamic(() =>
  import("./CommunicationsPanel").then((module) => module.CommunicationsPanel),
{ loading: load("A carregar comunicações") });
const ExpiringUnitsPanel = dynamic(() =>
  import("./ExpiringUnitsPanel").then((module) => module.ExpiringUnitsPanel),
{ loading: load("A carregar unidades a vencer") });
const HospitalPerformancePanel = dynamic(() =>
  import("./HospitalPerformancePanel").then((module) => module.HospitalPerformancePanel),
{ loading: load("A carregar desempenho hospitalar") });
const InventoryPanel = dynamic(() =>
  import("./InventoryPanel").then((module) => module.InventoryPanel),
{ loading: load("A carregar inventário") });
const QuickActionsPanel = dynamic(() =>
  import("./QuickActionsPanel").then((module) => module.QuickActionsPanel),
{ loading: load("A carregar ações rápidas") });

export function HospitalPortal() {
  return (
    <main className={styles.portal}>
      <HospitalSidebar />
      <section className={styles.content}>
        <HospitalHeader />
        <HospitalEntityGate>
        <div className={styles.workspace}>
          <section className={styles.heroRow}>
            <UrgentRequestCard />
            <div className={styles.kpiGrid}>
              <HospitalSummaryCards />
            </div>
          </section>
          <section className={styles.primaryGrid}>
            <ActiveRequestsTable />
            <IncomingDonorsList />
            <AppointmentSchedule />
          </section>
          <section className={advanced.advancedGrid}>
            <HospitalPerformancePanel />
            <InventoryPanel />
            <QuickActionsPanel />
          </section>
          <section className={advanced.balancedGrid}>
            <ExpiringUnitsPanel />
            <CommunicationsPanel />
            <AuditHistoryPanel />
          </section>
        </div>
        </HospitalEntityGate>
      </section>
    </main>
  );
}
