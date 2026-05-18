"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { createRequestAction } from "../workflow/workflowActions";
import styles from "./hospitalPortal.module.css";

export function UrgentRequestCard() {
  const [message, setMessage] = useState("Crie um pedido urgente e notifique dadores compatíveis.");
  const create = async () => {
    const result = await createRequestAction({ hospitalId: "h1", bloodType: "O-", units: 4 });
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
        <p className="muted">{message}</p>
        <button className="button" onClick={create} type="button">
          CRIAR PEDIDO URGENTE
        </button>
      </div>
    </article>
  );
}
