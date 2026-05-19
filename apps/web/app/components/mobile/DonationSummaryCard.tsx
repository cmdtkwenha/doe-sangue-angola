import type { Donor } from "@doe-sangue-angola/shared-types";
import styles from "./mobileProfile.module.css";

export function DonationSummaryCard({ donor }: { donor: Donor }) {
  const summary = [
    ["Pontos", donor.points.toLocaleString("pt-AO")],
    ["Doações", String(donor.totalDonations ?? 0)],
    ["Tipo sanguíneo", donor.bloodType],
    ["Elegibilidade", donor.eligibilityStatus ?? "Pendente"]
  ];

  return (
    <section className={styles.panel}>
      <strong>Resumo de doações</strong>
      <div className={styles.summaryGrid}>
        {summary.map(([label, value]) => (
          <article className={styles.summaryTile} key={label}>
            <small>{label}</small>
            <span className={styles.summaryValue}>{value}</span>
          </article>
        ))}
      </div>
      <article className={styles.historyRow}>
        <span>Última doação</span>
        <span className="muted">{donor.lastDonation || "Sem registo"}</span>
        <strong>{donor.bloodType}</strong>
      </article>
    </section>
  );
}
