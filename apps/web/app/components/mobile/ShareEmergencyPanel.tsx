import { getFamilyEmergency } from "@doe-sangue-angola/shared-services";
import styles from "./familyEmergency.module.css";

export function ShareEmergencyPanel() {
  const emergency = getFamilyEmergency();

  return (
    <section className={styles.panel}>
      <strong>Partilhar pedido</strong>
      <div className={styles.shareBox}>
        <span className="muted">Link público temporário</span>
        <span className={styles.link}>{emergency.shareLink}</span>
        <span>{emergency.agent.shareText}</span>
      </div>
      <button className="button" style={{ width: "100%", marginTop: 12 }} type="button">
        Copiar link
      </button>
    </section>
  );
}
