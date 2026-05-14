import styles from "./mobileApp.module.css";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";

export function RequestCard({ request }: { request: BloodRequest }) {
  const tone = request.urgency === "Critica"
    ? "critical"
    : request.urgency === "Alta"
      ? "warning"
      : "stable";
  const textTone = tone === "critical"
    ? styles.criticalText
    : tone === "warning"
      ? styles.warningText
      : styles.stableText;

  return (
    <article className={`${styles.request} ${styles[tone]}`}>
      <div className={styles.requestTop}>
        <span>
          <strong className={textTone}>{request.urgency}</strong>
          <br />
          <span className={`${styles.blood} ${textTone}`}>{request.bloodType}</span>
        </span>
        <span>
          <strong>{request.patientCode}</strong>
          <br />
          <small>{request.units} bolsas</small>
        </span>
        <span aria-hidden="true">⋮</span>
      </div>
      <div className={styles.requestMeta}>
        <small>Estado {request.status}</small>
        <small>Criado {request.createdAt.slice(11, 16)}</small>
        <button
          aria-label={`Aceitar pedido ${request.bloodType} para ${request.units} bolsas`}
          className={styles.accept}
          type="button"
        >
          ACEITAR
        </button>
      </div>
    </article>
  );
}
