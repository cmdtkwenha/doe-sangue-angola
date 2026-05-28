"use client";

import { useState } from "react";
import styles from "./pilot.module.css";

const roles = ["Dador", "Hospital", "Admin"] as const;

export function PilotFeedbackForm() {
  const [role, setRole] = useState<(typeof roles)[number]>("Dador");
  const [rating, setRating] = useState("4");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(message.trim()
      ? "Feedback registado localmente para revisão do piloto."
      : "Escreva uma observação antes de guardar.");
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className="eyebrow">Feedback piloto</div>
          <h2>Registar observações da sessão</h2>
        </div>
        <span className="pill">Local</span>
      </div>
      <form className={styles.form} onSubmit={submit}>
        <label>
          Perfil
          <select value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
            {roles.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Avaliação
          <select value={rating} onChange={(event) => setRating(event.target.value)}>
            <option value="5">5 · Excelente</option>
            <option value="4">4 · Bom</option>
            <option value="3">3 · Precisa ajustes</option>
            <option value="2">2 · Difícil</option>
          </select>
        </label>
        <label className={styles.full}>
          Observações
          <textarea
            onChange={(event) => setMessage(event.target.value)}
            placeholder="O que correu bem? O que bloqueou o utilizador?"
            rows={4}
            value={message}
          />
        </label>
        <button className="button" type="submit">Guardar feedback</button>
        {saved ? <p className="muted" role="status">{saved}</p> : null}
      </form>
    </section>
  );
}
