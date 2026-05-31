"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { createRequestAction } from "../workflow/workflowActions";
import styles from "./hospitalPortal.module.css";
import { ContextualTooltip } from "../support";
import { useCurrentHospital } from "./useCurrentHospital";

export function UrgentRequestCard() {
  const [message, setMessage] = useState("Crie um pedido urgente e notifique dadores compatíveis.");
  const { data: hospital } = useCurrentHospital();
  const create = async () => {
    if (!hospital?.id) {
      setMessage("Ligue a conta a um hospital aprovado antes de criar pedidos.");
      return;
    }
    if (hospital.verificationStatus !== "verified" || !hospital.verified) {
      setMessage("Conta em revisão ou bloqueada. Apenas hospitais verificados podem criar pedidos.");
      return;
    }
    const result = await createRequestAction({ hospitalId: hospital.id, bloodType: "O-", units: 4 });
    const request = ("request" in result
      ? result.request
      : "data" in result ? result.data?.request : undefined) as BloodRequest | undefined;
    setMessage(
      request
        ? `Pedido ${request.id} criado e sincronizado.`
        : result.message ?? "Não foi possível criar o pedido."
    );
  };

  return (
    <article className={styles.urgent}>
      <span className={styles.bolt}>!</span>
      <div>
        <strong>Solicitação Urgente com 1 Clique</strong>
        <ContextualTooltip
          title="Pedido urgente"
          text="Use apenas quando o hospital precisa de sangue imediato e quer notificar dadores compatíveis."
        />
        <p className="muted">{message}</p>
        <button className="button" disabled={hospital?.verificationStatus !== "verified"} onClick={create} type="button">
          CRIAR PEDIDO URGENTE
        </button>
      </div>
    </article>
  );
}
