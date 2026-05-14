import { getFamilyEmergency } from "@doe-sangue-angola/shared-services";
import styles from "./familyEmergency.module.css";
import { EmergencyStatusBadge } from "./EmergencyStatusBadge";

export function EmergencyCard() {
  const emergency = getFamilyEmergency();

  return (
    <section className={styles.card}>
      <div className={styles.hero}>
        <strong>Emergência familiar</strong>
        <span className={styles.blood}>{emergency.bloodType}</span>
        <small>{emergency.units} bolsas · {emergency.urgencyTime}</small>
      </div>
      <div className={styles.body}>
        <EmergencyStatusBadge status={emergency.status} />
        <strong>{emergency.hospitalLocation}</strong>
        <span className="muted">{emergency.agent.shareText}</span>
        <span className="muted">{emergency.relationship} · {emergency.phone}</span>
      </div>
    </section>
  );
}
