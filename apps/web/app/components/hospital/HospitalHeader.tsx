import { hospitals } from "@doe-sangue-angola/shared-services";
import styles from "./hospitalPortal.module.css";

export function HospitalHeader() {
  const hospital = hospitals.find((item) => item.id === "h1") ?? hospitals[0];

  return (
    <header className={styles.topbar}>
      <div className={styles.identity}>
        <span className={styles.avatar} />
        <div>
          <strong style={{ fontSize: 20 }}>{hospital.name}</strong>
          <span className="pill" style={{ marginLeft: 10 }}>Verificado</span>
          <div className="muted">{hospital.municipality}, {hospital.province}</div>
        </div>
      </div>
      <div className={styles.headerActions}>
        <span className="pill red">12 alertas</span>
        <strong>Dr. João Mendes</strong>
      </div>
    </header>
  );
}
