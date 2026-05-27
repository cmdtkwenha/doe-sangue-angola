"use client";

import styles from "./workflow.module.css";
import { acceptRequestAction } from "./workflowActions";
import { useWorkflowSnapshot } from "./useWorkflowSnapshot";

export function DonorAcceptanceFlow() {
  const { matches, request, responses, refresh } = useWorkflowSnapshot();
  const primaryDonor = matches.find((match) => match.donor?.id)?.donor;

  if (!request || !primaryDonor) return null;

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <div>
          <div className={styles.title}>Aceitação do Dador</div>
          <p className="muted">Pedido {request.bloodType} enviado aos dadores compatíveis.</p>
        </div>
        <span className="pill gold">{matches.length} matches</span>
      </div>
      <div className={styles.list}>
        {matches.filter((match) => match.donor?.id).slice(0, 3).map((match) => (
          <article className={styles.row} key={match.donor.id}>
            <span><strong>{match.donor.name}</strong><br /><small>{match.donor.bloodType} · score {match.score}</small></span>
            <span className="pill green">{match.recommendation}</span>
          </article>
        ))}
      </div>
      <div className={styles.actions}>
        <button className={`${styles.button} ${styles.primary}`} onClick={async () => { await acceptRequestAction(primaryDonor.id, request.id); refresh(); }} type="button">
          Aceitar pedido
        </button>
        <button className={`${styles.button} ${styles.soft}`} onClick={refresh} type="button">
          Recusar
        </button>
      </div>
      <p className="muted">{responses[0]?.donorName ?? primaryDonor.name}: {responses[0]?.decision ?? "aguarda resposta"}</p>
    </section>
  );
}
