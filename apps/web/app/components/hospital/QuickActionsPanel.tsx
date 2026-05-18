"use client";

import { createWorkflowRequest } from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { quickActions } from "./hospitalAgentService";

export function QuickActionsPanel() {
  const [message, setMessage] = useState("Selecione uma ação rápida.");
  const run = (title: string) => {
    if (title.includes("Pedido")) {
      const result = createWorkflowRequest({ hospitalId: "h1" });
      setMessage("request" in result ? `Pedido ${result.request.id} criado.` : result.message);
      return;
    }
    setMessage(`${title} aberto em modo mock.`);
  };

  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Ações Rápidas</strong>
      </div>
      <div className={styles.actionGrid}>
        {quickActions.map(([title, subtitle, tone]) => (
          <button className={styles.action} key={title} onClick={() => run(title)} type="button">
            <strong className={tone === "red" ? styles.redText : ""}>{title}</strong>
            <div className={base.rowMuted}>{subtitle}</div>
          </button>
        ))}
      </div>
      <p className={base.rowMuted}>{message}</p>
    </section>
  );
}
