"use client";

import { useState } from "react";
import { SupportIssueForm } from "../support";
import styles from "./mobileSafety.module.css";

export function ReportIssueForm() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className={styles.section}>
      <strong>Reportar Problema</strong>
      <p className={styles.finePrint}>
        Use este canal para reportar pedidos suspeitos, dados errados ou problemas no hospital.
      </p>
      <button className={styles.button} onClick={() => setExpanded((value) => !value)} type="button">
        {expanded ? "Fechar reporte" : "Abrir reporte"}
      </button>
      {expanded ? (
        <SupportIssueForm action="mobile-report" page="/mobile" role="donor" />
      ) : null}
    </section>
  );
}
