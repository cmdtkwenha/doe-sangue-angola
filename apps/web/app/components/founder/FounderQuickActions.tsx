"use client";

import {
  approveVerification,
  listHospitalVerificationQueue,
  monitoringService
} from "@doe-sangue-angola/shared-services";
import { useMemo, useState } from "react";
import styles from "./founder.module.css";

export function FounderQuickActions() {
  const [message, setMessage] = useState("Nenhuma ação executada.");
  const queue = useMemo(() =>
    listHospitalVerificationQueue().filter((item) => item.status !== "Verificado").slice(0, 3),
  []);

  function approve(id: string) {
    approveVerification(id);
    setMessage(`Hospital ${id} aprovado para revisão operacional.`);
  }

  function shutdownPreview() {
    monitoringService({
      message: "Simulação de encerramento de emergência acionada",
      status: "warning",
      type: "USER_ACTION"
    });
    setMessage("Simulação registada. Nenhum serviço foi desligado.");
  }

  return (
    <section className={styles.panel}>
      <div className="eyebrow">Ações rápidas</div>
      <h2>Atalhos do fundador</h2>
      <div className={styles.actions}>
        {queue.map((item) => (
          <article className={styles.approval} key={item.id}>
            <span><strong>{item.entity}</strong><br /><small className="muted">{item.reason}</small></span>
            <button className="button" onClick={() => approve(item.id)} type="button">Aprovar</button>
          </article>
        ))}
        <button className={`${styles.action} ${styles.danger}`} onClick={shutdownPreview} type="button">
          <strong>Simular encerramento de emergência</strong>
          <span className="muted">Regista a ação sem interromper a plataforma.</span>
        </button>
      </div>
      <p className="muted">{message}</p>
    </section>
  );
}
