import styles from "./hospitalPortal.module.css";
import { donorArrivals } from "./hospitalAgentService";

export function IncomingDonorsList() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Dadores a Caminho</strong>
        <a className="muted" href="#">Lista ETA</a>
      </div>
      <div className={styles.table}>
        {donorArrivals.map((donor) => (
          <article className={styles.donorRow} key={donor.pin}>
            <span>
              <strong>{donor.name}</strong><br />
              <span className={styles.rowMuted}>{donor.bloodType} · compatível</span>
            </span>
            <strong style={{ color: "#008a45" }}>{donor.eta}</strong>
            <span className="pill red">{donor.pin}<br /><span className={styles.rowMuted}>{donor.status}</span></span>
          </article>
        ))}
      </div>
      <a className={styles.footerLink} href="#">Ver todos os dadores</a>
    </section>
  );
}
