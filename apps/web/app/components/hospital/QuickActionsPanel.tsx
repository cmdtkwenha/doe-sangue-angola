"use client";

import { useState } from "react";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { quickActions } from "./hospitalAgentService";
import { createRequestAction } from "../workflow/workflowActions";
import { useCurrentHospital } from "./useCurrentHospital";

export function QuickActionsPanel() {
  const { data: hospital } = useCurrentHospital();
  const [message, setMessage] = useState("Selecione uma ação rápida.");
  const run = async (title: string) => {
    if (title.includes("Pedido")) {
      if (!hospital?.id) return setMessage("Associe primeiro a conta a um hospital aprovado.");
      const result = await createRequestAction({ hospitalId: hospital.id, bloodType: "O-", units: 4 });
      const request = ("request" in result
        ? result.request
        : "data" in result ? result.data?.request : undefined) as BloodRequest | undefined;
      setMessage(request ? `Pedido ${request.id} criado.` : result.message ?? "Ação não concluída.");
      return;
    }
    setMessage(`${title} pronto para dados reais do hospital.`);
  };

  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Ações Rápidas</strong>
      </div>
      <div className={styles.actionGrid}>
        {quickActions.map(([title, subtitle, tone]) => (
          <button className={styles.action} key={title} onClick={() => void run(title)} type="button">
            <strong className={tone === "red" ? styles.redText : ""}>{title}</strong>
            <div className={base.rowMuted}>{subtitle}</div>
          </button>
        ))}
      </div>
      <p className={base.rowMuted}>{message}</p>
    </section>
  );
}
