"use client";

import { resetInvestorDemoScenario } from "@doe-sangue-angola/shared-services";
import { useDemoMode } from "./DemoModeProvider";
import styles from "./demo.module.css";

export function DemoResetButton() {
  const { reset } = useDemoMode();

  return (
    <button
      className={styles.reset}
      onClick={() => {
        resetInvestorDemoScenario();
        reset();
      }}
      type="button"
    >
      Repor demo
    </button>
  );
}
