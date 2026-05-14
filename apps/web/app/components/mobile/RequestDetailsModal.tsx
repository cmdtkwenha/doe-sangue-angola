import { AccessibleModal } from "../accessibility";
import styles from "./mobileApp.module.css";
import { matchReasons, requests } from "./mobileMock";

export function RequestDetailsModal() {
  const request = requests[0];

  return (
    <AccessibleModal title="Detalhes do pedido">
      <div className={styles.modal}>
        <div className={styles.requestTop}>
          <h2 id="pedido-titulo">Detalhes do Pedido</h2>
          <button aria-label="Fechar detalhes do pedido" className={styles.iconButton} type="button">
            ×
          </button>
        </div>
        <p>
          <span className={`${styles.blood} ${styles.criticalText}`}>{request.bloodType}</span>
          <span className="pill red" style={{ marginLeft: 12 }}>{request.urgency}</span>
        </p>
        <h3>{request.hospital}</h3>
        <p>{request.units}</p>
        <div className={styles.modalMeta}>
          <small>Distância<br /><strong>{request.distance}</strong></small>
          <small>Precisam até<br /><strong>{request.time}</strong></small>
          <small>Emergência<br /><strong className={styles.criticalText}>MUITO ALTA</strong></small>
        </div>
        <hr />
        <strong>Por que você foi selecionada?</strong>
        {matchReasons.map((reason) => (
          <div className={styles.reason} key={reason}>
            <span className={styles.check}>✓</span>
            <span>{reason}</span>
          </div>
        ))}
        <button className={styles.accept} style={{ width: "100%", marginTop: 18 }} type="button">
          ACEITAR PEDIDO
        </button>
        <button className={styles.cancel} style={{ width: "100%", marginTop: 10 }} type="button">
          RECUSAR
        </button>
      </div>
    </AccessibleModal>
  );
}
