"use client";

import { useState } from "react";
import styles from "./support.module.css";

export function SupportIssueForm({ action, page, role }: {
  action: string;
  page: string;
  role: "admin" | "hospital" | "donor";
}) {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("Média");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("Problema operacional");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("A enviar reporte...");
    const response = await fetch("/api/support/issues", {
      body: JSON.stringify({ action, message, page, role, severity, type }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json().catch(() => ({ message: "Erro desconhecido." }));
    setStatus(payload.ok ? "Problema reportado com sucesso." : payload.message);
    if (payload.ok) setMessage("");
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label>
        Tipo
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option>Problema operacional</option>
          <option>Dado incorreto</option>
          <option>Erro de PIN</option>
          <option>Feedback do piloto</option>
        </select>
      </label>
      <label>
        Gravidade
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option>Baixa</option>
          <option>Média</option>
          <option>Alta</option>
          <option>Crítica</option>
        </select>
      </label>
      <label>
        Descrição
        <textarea
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Explique o que aconteceu e em que passo."
          required
          rows={4}
          value={message}
        />
      </label>
      <button className="button" type="submit">Reportar Problema</button>
      {status ? <p className="muted" role="status">{status}</p> : null}
    </form>
  );
}
