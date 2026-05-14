import {
  getWorkflowSnapshot,
  listAuditLogs,
  listNotifications
} from "@doe-sangue-angola/shared-services";
import styles from "./verification.module.css";

const checks = [
  "Hospital cria pedido",
  "Admin vê pedido",
  "Dador recebe notificação",
  "Dador pode aceitar",
  "PIN fica disponível",
  "Hospital valida PIN",
  "Auditoria regista ações"
];

export function DemoVerificationPanel() {
  const snapshot = getWorkflowSnapshot();
  const notifications = listNotifications("d1");
  const logs = listAuditLogs();
  const state = [
    Boolean(snapshot.request),
    Boolean(snapshot.request?.status),
    notifications.length > 0,
    snapshot.matches.length > 0,
    Boolean(snapshot.appointment?.pin),
    snapshot.appointment?.status === "Confirmado" || Boolean(snapshot.appointment),
    logs.length > 0
  ];

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <div>
          <div className="eyebrow">Verificação demo</div>
          <h2>Fluxos críticos</h2>
        </div>
        <span className={styles.status}>{state.filter(Boolean).length}/{checks.length}</span>
      </div>
      <div className={styles.list}>
        {checks.map((check, index) => (
          <div className={styles.item} key={check}>
            <span className={`${styles.dot} ${state[index] ? styles.ok : styles.warn}`} />
            <strong>{check}</strong>
            <span className={styles.status}>{state[index] ? "OK" : "Demo"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
