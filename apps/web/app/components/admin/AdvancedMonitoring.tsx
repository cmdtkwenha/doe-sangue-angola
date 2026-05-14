import styles from "./adminAdvanced.module.css";
import { AuditLogTable } from "./AuditLogTable";
import { DonorOnlineCount } from "./DonorOnlineCount";
import { EmergencyTicker } from "./EmergencyTicker";
import { FraudQueue } from "./FraudQueue";
import { PerformanceChart } from "./PerformanceChart";
import { RiskScoreCard } from "./RiskScoreCard";
import { ShortageAlerts } from "./ShortageAlerts";
import { TopHospitalsPanel } from "./TopHospitalsPanel";
import { VerificationQueue } from "./VerificationQueue";

export function AdvancedMonitoring() {
  return (
    <>
      <EmergencyTicker />
      <section className={styles.advancedGrid}>
        <ShortageAlerts />
        <DonorOnlineCount />
        <RiskScoreCard />
      </section>
      <section className={styles.advancedGrid}>
        <FraudQueue />
        <VerificationQueue />
        <AuditLogTable />
      </section>
      <section className={styles.wideGrid}>
        <PerformanceChart />
        <TopHospitalsPanel />
      </section>
    </>
  );
}
