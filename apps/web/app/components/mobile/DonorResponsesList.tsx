import { listFamilyDonorResponses } from "@doe-sangue-angola/shared-services";
import styles from "./familyEmergency.module.css";

export function DonorResponsesList() {
  return (
    <section className={styles.panel}>
      <strong>Respostas dos dadores</strong>
      {listFamilyDonorResponses().map(([name, type, status, eta]) => (
        <article className={styles.response} key={name}>
          <span>
            <strong>{name}</strong>
            <br />
            <small>{type} · {status}</small>
          </span>
          <span className="pill gold">{eta}</span>
        </article>
      ))}
    </section>
  );
}
