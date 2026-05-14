import styles from "./mobileProfile.module.css";
import { donor } from "./mobileMock";

const qrCells = Array.from({ length: 16 }, (_, index) => index);
const darkCells = new Set([0, 1, 3, 4, 6, 9, 10, 12, 14, 15]);

export function DigitalDonorCard() {
  return (
    <section className={styles.digitalCard}>
      <div className={styles.cardTop}>
        <span>
          <strong>Sangue Angola</strong>
          <br />
          <small>Cartão de Dador</small>
        </span>
        <div className={styles.qr} aria-label="Código QR do dador">
          {qrCells.map((cell) => (
            <span key={cell} style={{ opacity: darkCells.has(cell) ? 1 : 0 }} />
          ))}
        </div>
      </div>
      <h2>{donor.name}</h2>
      <div className={styles.bloodType}>{donor.bloodType}</div>
      <small>ID Dador<br />{donor.id}</small>
    </section>
  );
}
