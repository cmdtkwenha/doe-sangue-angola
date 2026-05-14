import styles from "./hospitalAdvanced.module.css";
import { pinValidation } from "./hospitalAgentService";

export function PinValidationCard() {
  return (
    <section className={styles.pinCard}>
      <div className="eyebrow">Validação PIN</div>
      <h2>Confirmar dador recebido</h2>
      <div className={styles.pinGrid}>
        {pinValidation.pin.split("").map((digit, index) => (
          <span className={styles.digit} key={`${digit}-${index}`}>{digit}</span>
        ))}
      </div>
      <div className={styles.rowTop}>
        <span>
          <strong>{pinValidation.donor}</strong>
          <br />
          <span className="muted">{pinValidation.bloodType} · risco {pinValidation.risk}</span>
        </span>
        <span className="pill green">Agente validado</span>
      </div>
      <input
        className={styles.pinInput}
        defaultValue={pinValidation.pin}
        inputMode="numeric"
        maxLength={4}
        aria-label="PIN de 4 dígitos"
      />
      <button className="button" type="button">Validar chegada</button>
    </section>
  );
}
