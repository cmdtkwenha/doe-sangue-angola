"use client";

import {
  getWorkflowSnapshot
} from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import { acceptRequestAction, updateStatusAction } from "../../workflow/workflowActions";
import styles from "./hospitalAutomation.module.css";

export function ConfirmationFlow() {
  const [, refresh] = useState(0);
  const snapshot = getWorkflowSnapshot();
  const request = snapshot.request;
  const donor = snapshot.matches[0]?.donor;

  if (!request || !donor) return null;

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Confirmação do Dador</strong>
        <span className="pill gold">{request.status}</span>
      </div>
      <div className={styles.step}>
        <strong>{donor.name}</strong>
        <span className="muted">{donor.bloodType} · compatível · {donor.municipality}</span>
      </div>
      <div className={styles.row}>
        <button className={styles.button} onClick={async () => { await acceptRequestAction(donor.id, request.id); refresh((item) => item + 1); }} type="button">
          Confirmar aceitação
        </button>
        <button className={styles.secondary} onClick={async () => { await updateStatusAction(request.id, "Dador a Caminho"); refresh((item) => item + 1); }} type="button">
          Dador a caminho
        </button>
      </div>
    </section>
  );
}
