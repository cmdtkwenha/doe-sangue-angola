import type { Donor } from "@doe-sangue-angola/shared-types";
import styles from "./mobileProfile.module.css";

export function ProfileProgress({ donor }: { donor: Donor }) {
  const completion = getCompletion(donor);
  return (
    <section className={styles.panel}>
      <strong>Perfil completo</strong>
      <p className="muted">{completion}% dos dados verificados</p>
      <div className={styles.progressTrack}>
        <span className={styles.progressFill} style={{ width: `${completion}%` }} />
      </div>
      <span className={styles.status}>{donor.available ? "Disponível" : "Indisponível"}</span>
    </section>
  );
}

function getCompletion(donor: Donor) {
  const fields = [
    donor.name,
    donor.bloodType,
    donor.province,
    donor.municipality,
    donor.phone,
    donor.birthDate
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}
