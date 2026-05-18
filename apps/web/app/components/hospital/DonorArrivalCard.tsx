"use client";

import { useState } from "react";
import { validatePinAction } from "../workflow/workflowActions";
import { useWorkflowSnapshot } from "../workflow/useWorkflowSnapshot";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";

export function DonorArrivalCard() {
  const [validated, setValidated] = useState<Record<string, string>>({});
  const { appointment, matches, request, refresh } = useWorkflowSnapshot();
  const donor = matches[0]?.donor;
  const confirm = async (pin: string) => {
    const result = await validatePinAction(pin, request?.id ?? "");
    setValidated({ ...validated, [pin]: result.message ?? "Validação registada." });
    refresh();
  };

  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Confirmações de Chegada</strong>
        <span className="pill green">Tempo real</span>
      </div>
      {!appointment || !donor ? (
        <p className={base.rowMuted}>Nenhum dador aceite ainda. Aguarde a aceitação no app móvel.</p>
      ) : (
        <article className={styles.arrivalCard} key={appointment.id}>
          <div className={styles.rowTop}>
            <strong>{donor.name}</strong>
            <span className="pill red">PIN {appointment.pin}</span>
          </div>
          <span className={base.rowMuted}>
            {donor.bloodType} · ETA {appointment.time} · {request?.status}
          </span>
          <button className="button" onClick={() => confirm(appointment.pin)} type="button">
            {validated[appointment.pin] ? "Validado" : "Confirmar chegada"}
          </button>
          {validated[appointment.pin] ? <span className={base.rowMuted}>{validated[appointment.pin]}</span> : null}
        </article>
      )}
    </section>
  );
}
