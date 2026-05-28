"use client";

import { useState } from "react";
import { validatePinAction } from "../workflow/workflowActions";
import { useWorkflowSnapshot } from "../workflow/useWorkflowSnapshot";
import styles from "./hospitalAdvanced.module.css";
import { ContextualTooltip } from "../support";

export function PinValidationCard() {
  const { appointment, matches, request, refresh } = useWorkflowSnapshot();
  const expected = appointment?.pin ?? "";
  const donor = matches[0]?.donor;
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("Aguardando validação.");
  const validate = async () => {
    const result = await validatePinAction(pin || expected, request?.id ?? "");
    setMessage(result.ok ? "PIN validado e pedido atualizado." : result.message);
    refresh();
  };

  return (
    <section className={styles.pinCard}>
      <div className="eyebrow">Validação PIN</div>
      <h2>Confirmar dador recebido</h2>
      <ContextualTooltip
        title="Validação PIN"
        text="Peça o PIN mostrado na app do dador. Só valide se o dador chegou presencialmente."
      />
      <div className={styles.pinGrid}>
        {(expected || "----").split("").map((digit, index) => (
          <span className={styles.digit} key={`${digit}-${index}`}>{digit}</span>
        ))}
      </div>
      <div className={styles.rowTop}>
        <span>
          <strong>{donor?.name ?? "Aguardando dador"}</strong>
          <br />
          <span className="muted">{donor?.bloodType ?? "Sem PIN gerado"} · {request?.status ?? "pendente"}</span>
        </span>
        <span className="pill green">{appointment ? "PIN gerado" : "Aguardando aceite"}</span>
      </div>
      <input
        className={styles.pinInput}
        inputMode="numeric"
        maxLength={4}
        onChange={(event) => setPin(event.target.value)}
        aria-label="PIN de 4 dígitos"
        value={pin}
      />
      <button className="button" disabled={!expected} onClick={validate} type="button">Validar chegada</button>
      <span className="muted">{message}</span>
    </section>
  );
}
