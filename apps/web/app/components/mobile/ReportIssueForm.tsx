"use client";

import { useState } from "react";
import styles from "./mobileSafety.module.css";

export function ReportIssueForm() {
  const [sent, setSent] = useState(false);

  return (
    <section className={styles.section}>
      <strong>Reportar Problema</strong>
      <p className={styles.finePrint}>
        Use este canal para reportar pedidos suspeitos, dados errados ou problemas no hospital.
      </p>
      <select className={styles.input} aria-label="Tipo de problema">
        <option>Pedido suspeito</option>
        <option>Dados incorretos</option>
        <option>Problema no agendamento</option>
        <option>Outro</option>
      </select>
      <textarea className={styles.textarea} placeholder="Descreva o que aconteceu" />
      <button className={styles.button} onClick={() => setSent(true)} type="button">
        Enviar reporte
      </button>
      {sent ? <span className="pill green">Reporte recebido com segurança</span> : null}
    </section>
  );
}
