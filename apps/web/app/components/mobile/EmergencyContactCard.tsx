import styles from "./mobileProfile.module.css";
import { emergencyContact } from "./mobileMock";

export function EmergencyContactCard() {
  return (
    <section className={styles.panel}>
      <div className={styles.contact}>
        <span>
          <strong>{emergencyContact.name}</strong>
          <br />
          <small className="muted">{emergencyContact.relation}</small>
        </span>
        <a className="pill red" href={`tel:${emergencyContact.phone}`}>Ligar</a>
      </div>
      <p className="muted">{emergencyContact.phone}</p>
    </section>
  );
}
