import { appConstants } from "@doe-sangue-angola/shared-services";
import styles from "./support.module.css";

export function SupportContactSection() {
  return (
    <section className={styles.contact}>
      <div>
        <div className="eyebrow">Suporte</div>
        <h2>Contactos operacionais</h2>
      </div>
      <div className={styles.contactGrid}>
        <Contact label="WhatsApp" value={appConstants.supportPhone} />
        <Contact label="Email" value={appConstants.supportEmail} />
        <Contact label="Linha de emergência" value="+244 000 000 000" />
      </div>
    </section>
  );
}

function Contact({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.step}>
      <strong>{label}</strong>
      <span className="muted">{value}</span>
    </article>
  );
}
