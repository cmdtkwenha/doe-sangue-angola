import { DemoVerificationPanel } from "./DemoVerificationPanel";
import { SystemHealthPanel } from "./SystemHealthPanel";
import styles from "./verification.module.css";

export function VerificationGrid() {
  return (
    <div className={styles.grid}>
      <DemoVerificationPanel />
      <SystemHealthPanel />
    </div>
  );
}
