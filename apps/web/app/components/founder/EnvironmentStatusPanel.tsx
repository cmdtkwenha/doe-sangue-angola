import styles from "./founder.module.css";
import { EnvironmentStatusCard } from "./EnvironmentStatusCard";

export function EnvironmentStatusPanel() {
  return (
    <section className={styles.panel}>
      <EnvironmentStatusCard />
    </section>
  );
}
