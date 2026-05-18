"use client";

import { useState } from "react";
import styles from "./workflow.module.css";
import { completeDonationAction } from "./workflowActions";
import { useWorkflowSnapshot } from "./useWorkflowSnapshot";

export function CompletionFlow() {
  const { request, responses, refresh } = useWorkflowSnapshot();
  const [message, setMessage] = useState("Aguardando conclusão da doação.");
  const donorId = responses.find((item) => item.decision === "Aceite")?.donorId ?? "d1";

  if (!request) return null;

  async function complete() {
    if (!request) return;
    const result = await completeDonationAction(donorId, request.id);
    if (result.ok) setMessage("Concluído: pontos e auditoria sincronizados.");
    refresh();
  }

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <div>
          <div className={styles.title}>Conclusão e Recompensa</div>
          <p className="muted">{message}</p>
        </div>
        <span className="pill green">rewardAgent</span>
      </div>
      <button className={`${styles.button} ${styles.primary}`} onClick={complete} type="button">
        Marcar doação concluída
      </button>
    </section>
  );
}
