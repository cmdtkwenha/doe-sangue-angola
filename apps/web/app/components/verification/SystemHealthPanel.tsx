import {
  getDataProviderStatus,
  listAuditLogs,
  listNotifications,
  listRequests
} from "@doe-sangue-angola/shared-services";
import styles from "./verification.module.css";

export function SystemHealthPanel() {
  const provider = getDataProviderStatus();
  const items = [
    ["Data layer", provider.ready ? provider.message : "Configuração pendente", provider.ready],
    ["Pedidos", `${listRequests().length} pedidos disponíveis`, listRequests().length > 0],
    ["Notificações", `${listNotifications("d1").length} notificações de dador`, true],
    ["Auditoria", `${listAuditLogs().length} eventos registados`, listAuditLogs().length > 0]
  ] as const;

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <div>
          <div className="eyebrow">Saúde do sistema</div>
          <h2>Estado operacional</h2>
        </div>
        <span className={styles.status}>{provider.mode}</span>
      </div>
      <div className={styles.list}>
        {items.map(([label, value, ok]) => (
          <div className={styles.item} key={label}>
            <span className={`${styles.dot} ${ok ? styles.ok : styles.warn}`} />
            <span><strong>{label}</strong><br /><small className="muted">{value}</small></span>
            <span className={styles.status}>{ok ? "OK" : "Atenção"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
