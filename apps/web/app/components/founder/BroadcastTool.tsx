"use client";

import { useState } from "react";
import styles from "./founder.module.css";

export function BroadcastTool() {
  const [message, setMessage] = useState("Há uma atualização importante do Doe Sangue Angola.");
  const [status, setStatus] = useState("Pronto para enviar notificação de teste.");

  function sendBroadcast() {
    setStatus("Envio real deve ser feito pelo centro de notificações com Supabase ativo.");
  }

  return (
    <section className={styles.panel}>
      <div className="eyebrow">Comunicação</div>
      <h2>Enviar aviso seguro</h2>
      <textarea
        aria-label="Mensagem para dadores"
        className={styles.textarea}
        onChange={(event) => setMessage(event.target.value)}
        value={message}
      />
      <button className="button" onClick={sendBroadcast} type="button">
        Enviar notificação de teste
      </button>
      <p className="muted">{status}</p>
    </section>
  );
}
