import {
  getMonitoringSummary,
  getNationalRiskScore,
  listErrorLogs
} from "@doe-sangue-angola/shared-services";
import styles from "./founder.module.css";

export function PlatformHealthCard() {
  const monitoring = getMonitoringSummary();
  const risk = getNationalRiskScore();
  const errors = listErrorLogs().length;
  const stable = errors === 0 && risk.level !== "alto";

  return (
    <section className={styles.panel}>
      <div className="eyebrow">Saúde da plataforma</div>
      <h2>{stable ? "Operação estável" : "Requer atenção"}</h2>
      <div className={styles.envGrid}>
        <Item label="Eventos monitorizados" value={monitoring.events} />
        <Item label="Erros abertos" value={errors} tone={errors ? "red" : "green"} />
        <Item label="Score de risco" value={risk.score} tone={risk.level === "alto" ? "red" : "gold"} />
        <Item label="API média" value={`${monitoring.averageApiMs} ms`} />
      </div>
    </section>
  );
}

function Item({ label, tone, value }: { label: string; tone?: string; value: number | string }) {
  return (
    <article className={styles.env}>
      <span className="muted">{label}</span>
      <h3>{value}</h3>
      <span className={`pill ${tone ?? ""}`.trim()}>{tone === "red" ? "Atenção" : "OK"}</span>
    </article>
  );
}
