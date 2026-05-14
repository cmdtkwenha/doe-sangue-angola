import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { donorArrivals } from "./hospitalAgentService";

export function DonorArrivalCard() {
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Confirmações de Chegada</strong>
        <span className="pill green">Tempo real</span>
      </div>
      {donorArrivals.map((donor) => (
        <article className={styles.arrivalCard} key={donor.name}>
          <div className={styles.rowTop}>
            <strong>{donor.name}</strong>
            <span className="pill red">PIN {donor.pin}</span>
          </div>
          <span className={base.rowMuted}>
            {donor.bloodType} · ETA {donor.eta} · compatibilidade {donor.score}%
          </span>
          <button className="button" type="button">{donor.status}</button>
        </article>
      ))}
    </section>
  );
}
