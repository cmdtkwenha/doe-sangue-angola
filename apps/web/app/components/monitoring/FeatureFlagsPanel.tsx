import { getFeatureFlags } from "@doe-sangue-angola/shared-services";
import styles from "./monitoring.module.css";

export function FeatureFlagsPanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Feature Flags</strong>
        <span className="pill">Launch control</span>
      </div>
      {getFeatureFlags().map((flag) => (
        <article className={styles.row} key={flag.key}>
          <span className={flag.enabled ? "pill green" : "pill gold"}>
            {flag.enabled ? "Ativo" : "Pausado"}
          </span>
          <span>
            <strong>{flag.label}</strong>
            <br />
            <small className="muted">{flag.description}</small>
          </span>
          <span className="muted">{flag.key}</span>
        </article>
      ))}
    </section>
  );
}
