import { referrals } from "./mobileDonorAgents";
import styles from "./mobileGamification.module.css";

export function ReferralPanel() {
  return (
    <section className={styles.panel}>
      <strong>Indique e Ganhe</strong>
      <p className="muted">Convide 3 amigos e ganhe 250 pontos.</p>
      <div className={styles.codeBox}>
        <span>
          <small>Seu código</small>
          <br />
          <strong>{referrals.code}</strong>
        </span>
        <span className="pill gold">{referrals.completed}/{referrals.target}</span>
      </div>
      {referrals.referrals.map((item) => (
        <article className={styles.referral} key={item.name}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{item.name}</strong>
            <span className={item.status === "Pendente" ? styles.redText : styles.greenText}>
              {item.status}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
