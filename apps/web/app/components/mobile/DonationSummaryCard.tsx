import styles from "./mobileProfile.module.css";
import { donationHistory, donationSummary } from "./mobileMock";

export function DonationSummaryCard() {
  return (
    <section className={styles.panel}>
      <strong>Resumo de doações</strong>
      <div className={styles.summaryGrid}>
        {donationSummary.map(([label, value]) => (
          <article className={styles.summaryTile} key={label}>
            <small>{label}</small>
            <span className={styles.summaryValue}>{value}</span>
          </article>
        ))}
      </div>
      {donationHistory.map(([date, place, type]) => (
        <article className={styles.historyRow} key={`${date}-${place}`}>
          <span>{date}</span>
          <span className="muted">{place}</span>
          <strong>{type}</strong>
        </article>
      ))}
    </section>
  );
}
