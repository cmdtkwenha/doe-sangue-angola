"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./pilotFeedback.module.css";

const issueTypes = [
  ["bug", "Bug"],
  ["login_problem", "Problema de login"],
  ["request_problem", "Problema com pedido"],
  ["pin_problem", "Problema com PIN"],
  ["notification_problem", "Problema com notificação"],
  ["ui_confusion", "Confusão na interface"],
  ["other", "Outro"]
] as const;
const severities = [["low", "Baixa"], ["medium", "Média"], ["high", "Alta"], ["critical", "Crítica"]] as const;

export function PilotFeedbackButton({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [issueType, setIssueType] = useState("bug");
  const [severity, setSeverity] = useState("medium");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim()) {
      setMessage("Descreva o problema antes de enviar.");
      return;
    }
    setSaving(true);
    const response = await fetch("/api/pilot-feedback", {
      body: JSON.stringify({ contact, description, issueType, page: pathname, severity }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json().catch(() => ({ message: "Erro desconhecido." }));
    setSaving(false);
    if (!payload.ok) {
      setMessage(payload.message ?? "Não foi possível enviar.");
      return;
    }
    setDescription("");
    setContact("");
    setMessage("Obrigado. A sua mensagem foi enviada.");
  }

  return (
    <>
      <button className={compact ? styles.compact : styles.button} onClick={() => setOpen(true)} type="button">
        Reportar Problema
      </button>
      {open ? (
        <div className={styles.backdrop} role="presentation">
          <form className={styles.modal} onSubmit={submit}>
            <header>
              <span>
                <strong>Reportar Problema</strong>
                <small>Ajude-nos a melhorar o piloto.</small>
              </span>
              <button aria-label="Fechar" onClick={() => setOpen(false)} type="button">×</button>
            </header>
            <label>
              Tipo de problema
              <select onChange={(event) => setIssueType(event.target.value)} value={issueType}>
                {issueTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              Gravidade
              <select onChange={(event) => setSeverity(event.target.value)} value={severity}>
                {severities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              Descrição
              <textarea onChange={(event) => setDescription(event.target.value)} rows={4} value={description} />
            </label>
            <label>
              Contacto opcional
              <input onChange={(event) => setContact(event.target.value)} value={contact} />
            </label>
            <footer>
              <button disabled={saving} type="button" onClick={() => setOpen(false)}>Cancelar</button>
              <button disabled={saving} type="submit">{saving ? "A enviar..." : "Enviar"}</button>
            </footer>
            {message ? <p className="muted" role="status">{message}</p> : null}
          </form>
        </div>
      ) : null}
    </>
  );
}
