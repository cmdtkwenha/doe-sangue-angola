import { hospitals } from "@doe-sangue-angola/shared-services";
import styles from "./adminAdvanced.module.css";

const totals = [342, 238, 189];

export function TopHospitalsPanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Top Hospitais por Pedidos</strong>
        <span className="muted">Últimos 30 dias</span>
      </div>
      {hospitals.map((hospital, index) => (
        <div className={styles.barRow} key={hospital.id}>
          <strong>{index + 1}. {hospital.name}</strong>
          <div className={styles.bar}>
            <span style={{ width: `${90 - index * 18}%` }} />
          </div>
          <span className="muted">{totals[index]} pedidos</span>
        </div>
      ))}
    </section>
  );
}
