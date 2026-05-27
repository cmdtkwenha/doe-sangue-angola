import styles from "./monitoring.module.css";

const backupStatus = [
  { label: "Snapshot diário", value: "Planeado", status: "warning" },
  { label: "Exportação SQL", value: "Placeholder", status: "warning" },
  { label: "Logs de auditoria", value: "Protegidos", status: "ok" },
  { label: "Teste de restore", value: "Pendente", status: "warning" }
] as const;

export function BackupStatusPanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Estado de Backups</strong>
        <span className="pill gold">Preparação</span>
      </div>
      <p className="muted">
        Arquitetura de recuperação preparada. A ligação final de backup deve ser validada antes do piloto.
      </p>
      <div className={styles.metrics}>
        {backupStatus.map((item) => (
          <article className={styles.metric} key={item.label}>
            <span className="muted">{item.label}</span>
            <strong>{item.value}</strong>
            <small className={styles[item.status]}>{item.status === "ok" ? "Pronto" : "A preparar"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
