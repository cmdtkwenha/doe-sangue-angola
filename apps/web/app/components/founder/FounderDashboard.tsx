import { BroadcastTool } from "./BroadcastTool";
import { EnvironmentStatusPanel } from "./EnvironmentStatusPanel";
import { FounderQuickActions } from "./FounderQuickActions";
import { GrowthMetrics } from "./GrowthMetrics";
import { PlatformHealthCard } from "./PlatformHealthCard";
import styles from "./founder.module.css";

export function FounderDashboard() {
  return (
    <section className={styles.dashboard}>
      <section className={styles.hero}>
        <div>
          <div className="eyebrow">Founder Admin</div>
          <h2>Centro simples para gerir o piloto</h2>
          <p className="muted">
            Visão clara da saúde, crescimento, aprovações e comunicações sem passos técnicos.
          </p>
        </div>
        <span className="pill green">Pronto para operar</span>
      </section>
      <GrowthMetrics />
      <section className={styles.grid}>
        <PlatformHealthCard />
        <EnvironmentStatusPanel />
      </section>
      <section className={styles.grid}>
        <FounderQuickActions />
        <BroadcastTool />
      </section>
    </section>
  );
}
