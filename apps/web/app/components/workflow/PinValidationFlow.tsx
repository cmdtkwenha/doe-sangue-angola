"use client";

import { useState } from "react";
import styles from "./workflow.module.css";
import { updateStatusAction, validatePinAction } from "./workflowActions";
import { useWorkflowSnapshot } from "./useWorkflowSnapshot";

export function PinValidationFlow() {
  const { appointment, request, refresh } = useWorkflowSnapshot();
  const [pin, setPin] = useState("");
  const expected = appointment?.pin ?? "0302";

  if (!request) return null;

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <div>
          <div className={styles.title}>Validação do PIN</div>
          <p className="muted">Confirme o código de 4 dígitos apresentado pelo dador.</p>
        </div>
        <span className="pill gold">{request.status}</span>
      </div>
      <div className={styles.pinBox}>{expected}</div>
      <div className={styles.actions}>
        <button className={`${styles.button} ${styles.soft}`} onClick={async () => { await updateStatusAction(request.id, "Dador a Caminho"); refresh(); }} type="button">
          Dador a caminho
        </button>
        <input className={styles.input} maxLength={4} onChange={(event) => setPin(event.target.value)} placeholder="PIN" value={pin} />
        <button className={`${styles.button} ${styles.primary}`} onClick={async () => { await validatePinAction(pin || expected, request.id); refresh(); }} type="button">
          Validar PIN
        </button>
      </div>
    </section>
  );
}
