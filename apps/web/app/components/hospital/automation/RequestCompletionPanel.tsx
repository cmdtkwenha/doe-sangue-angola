"use client";

import { updateInventoryAfterDonation } from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import { completeDonationAction } from "../../workflow/workflowActions";
import { useWorkflowSnapshot } from "../../workflow/useWorkflowSnapshot";
import styles from "./hospitalAutomation.module.css";

export function RequestCompletionPanel() {
  const [message, setMessage] = useState("Aguardando validação do PIN.");
  const snapshot = useWorkflowSnapshot();
  const request = snapshot.request;
  const donorId = snapshot.responses.find((item) => item.decision === "Aceite")?.donorId ?? "d1";

  if (!request) return null;

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Conclusão do Pedido</strong>
        <span className="pill green">{request.status}</span>
      </div>
      <p className="muted">{message}</p>
      <button className={styles.button} onClick={async () => {
        const result = await completeDonationAction(donorId, request.id);
        if (result.ok) {
          updateInventoryAfterDonation(request.bloodType, 1);
          setMessage(`Doação concluída. Inventário ${request.bloodType} atualizado.`);
        }
      }} type="button">
        Concluir doação e atualizar inventário
      </button>
    </section>
  );
}
