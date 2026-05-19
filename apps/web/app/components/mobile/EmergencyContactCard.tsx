import type { Donor } from "@doe-sangue-angola/shared-types";
import styles from "./mobileProfile.module.css";

export function EmergencyContactCard({ donor }: { donor: Donor }) {
  return (
    <section className={styles.panel}>
      <div className={styles.contact}>
        <span>
          <strong>Contacto principal</strong>
          <br />
          <small className="muted">Telefone registado no perfil</small>
        </span>
        {donor.phone ? <a className="pill red" href={`tel:${donor.phone}`}>Ligar</a> : null}
      </div>
      <p className="muted">{donor.phone || "Sem telefone registado"}</p>
    </section>
  );
}
