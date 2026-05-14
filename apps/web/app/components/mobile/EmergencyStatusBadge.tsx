import type { FamilyEmergencyStatus } from "@doe-sangue-angola/shared-services";
import styles from "./familyEmergency.module.css";

const tone: Record<FamilyEmergencyStatus, string> = {
  Pendente: styles.pending,
  Verificado: styles.verified,
  Expirado: styles.expired,
  Resolvido: styles.resolved
};

export function EmergencyStatusBadge({ status }: { status: FamilyEmergencyStatus }) {
  return <span className={`${styles.badge} ${tone[status]}`}>{status}</span>;
}
