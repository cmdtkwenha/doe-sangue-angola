import { getNationalRiskScore } from "@doe-sangue-angola/shared-services";
import styles from "./adminAdvanced.module.css";

export function RiskScoreCard() {
  const risk = getNationalRiskScore();
  const tone = risk.level === "alto" ? styles.riskHigh : risk.level === "medio" ? styles.riskMedium : styles.riskLow;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Score Nacional de Risco</strong>
        <span className={`pill ${risk.level === "alto" ? "red" : "gold"}`}>{risk.level}</span>
      </div>
      <div className={`${styles.riskScore} ${tone}`}>{risk.score}</div>
      <div className={styles.riskMeta}>
        <span>{risk.openReviews} revisões abertas</span>
        <span>{risk.verifiedHospitals} hospitais verificados</span>
      </div>
    </section>
  );
}
