import { AccessibleModal } from "../accessibility";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import styles from "./mobileApp.module.css";
import { matchReasons } from "./mobileMock";

export function RequestDetailsModal({
  onAccept,
  onClose,
  onReject,
  open,
  request
}: {
  onAccept?: () => void;
  onClose?: () => void;
  onReject?: () => void;
  open: boolean;
  request: BloodRequest | null;
}) {
  if (!open || !request) return null;

  return (
    <AccessibleModal onClose={onClose} title="Detalhes do pedido">
      <div className={styles.modal}>
        <div className={styles.requestTop}>
          <h2 id="pedido-titulo">Detalhes do Pedido</h2>
          <button
            aria-label="Fechar detalhes do pedido"
            className={styles.iconButton}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <p>
          <span className={`${styles.blood} ${styles.criticalText}`}>{request.bloodType}</span>
          <span className="pill red" style={{ marginLeft: 12 }}>{request.urgency}</span>
        </p>
        <h3>{request.hospitalName ?? "Hospital"}</h3>
        <p className="muted">{request.hospitalLocation ?? "Localização a confirmar"}</p>
        <p>Precisam de {request.units} bolsas · Pedido {request.patientCode}</p>
        <div className={styles.modalMeta}>
          <small>Tipo<br /><strong>{request.bloodType}</strong></small>
          <small>Criado<br /><strong>{request.createdAt.slice(11, 16)}</strong></small>
          <small>Urgência<br /><strong className={styles.criticalText}>{request.urgency}</strong></small>
        </div>
        <hr />
        <strong>Por que você foi selecionada?</strong>
        {matchReasons.map((reason) => (
          <div className={styles.reason} key={reason}>
            <span className={styles.check}>✓</span>
            <span>{reason}</span>
          </div>
        ))}
        <button
          className={styles.accept}
          onClick={onAccept}
          style={{ width: "100%", marginTop: 18 }}
          type="button"
        >
          ACEITAR PEDIDO
        </button>
        <button
          className={styles.cancel}
          onClick={onReject}
          style={{ width: "100%", marginTop: 10 }}
          type="button"
        >
          RECUSAR
        </button>
      </div>
    </AccessibleModal>
  );
}
