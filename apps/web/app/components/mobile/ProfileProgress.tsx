import styles from "./mobileProfile.module.css";
import { donor } from "./mobileMock";

export function ProfileProgress() {
  return (
    <section className={styles.panel}>
      <strong>Perfil completo</strong>
      <p className="muted">{donor.profileCompletion}% dos dados verificados</p>
      <div className={styles.progressTrack}>
        <span className={styles.progressFill} />
      </div>
      <span className={styles.status}>{donor.eligibility}</span>
    </section>
  );
}
