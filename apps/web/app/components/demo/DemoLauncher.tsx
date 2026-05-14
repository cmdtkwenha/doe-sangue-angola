"use client";

import { DemoAccountsPanel } from "./DemoAccountsPanel";
import { DemoResetButton } from "./DemoResetButton";
import { DemoScenarioGenerator } from "./DemoScenarioGenerator";
import { GuidedTour } from "./GuidedTour";
import styles from "./demo.module.css";

export function DemoLauncher() {
  return (
    <section className={styles.launcher}>
      <div className={styles.launchHead}>
        <span>
          <div className="eyebrow">Presentation Mode</div>
          <h2>Modo apresentação para investidores</h2>
          <p className="muted">
            Contas demo, roteiro guiado, pedido ao vivo, notificações e realtime fake.
          </p>
        </span>
        <DemoResetButton />
      </div>
      <DemoAccountsPanel />
      <DemoScenarioGenerator />
      <GuidedTour />
    </section>
  );
}
