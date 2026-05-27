import { getEnvironmentStatus } from "@doe-sangue-angola/shared-services";
import styles from "./founder.module.css";

const levelLabel = {
  ok: "Pronto",
  aviso: "Atenção",
  erro: "Corrigir"
} as const;

export function EnvironmentStatusCard() {
  const { config, validation } = getEnvironmentStatus();
  const status = validation.ready ? "Ambiente pronto" : "Requer configuração";

  return (
    <article className={styles.statusCard}>
      <div>
        <div className="eyebrow">Ambiente</div>
        <h3>{status}</h3>
        <p className="muted">
          {config.label} com dados em {config.dataMode === "mock" ? "ambiente seguro" : "produção"}.
        </p>
      </div>

      <div className={styles.envGrid}>
        <Item label="Modo" value={config.label} />
        <Item label="Dados" value={config.dataMode === "mock" ? "Seguro" : "Produção"} />
        <Item label="Piloto" value={config.pilotMode ? "Ativo" : "Inativo"} />
        <Item label="Notificações" value={config.safeNotifications ? "Seguras" : "Reais"} />
      </div>

      <div className={styles.checkList}>
        {validation.checks.map((item) => (
          <div className={styles.checkRow} data-level={item.level} key={item.name}>
            <strong>{item.name}</strong>
            <span>{levelLabel[item.level]}</span>
            <small>{item.founderHelp}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.env}>
      <span className="muted">{label}</span>
      <h3>{value}</h3>
    </div>
  );
}
