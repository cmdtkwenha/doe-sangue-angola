"use client";

import { useState } from "react";
import styles from "./onboarding.module.css";

export function OnboardingSummary({
  action,
  fields,
  title
}: {
  action: string;
  fields: Array<[string, string]>;
  title: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <aside className={styles.summary}>
      <div>
        <div className="eyebrow">Dados mock</div>
        <h2>{title}</h2>
      </div>
      <div className={styles.fieldGrid}>
        {fields.map(([label, value]) => (
          <div className={styles.field} key={label}>
            <span className="muted">{label}</span>
            <br />
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <button className="button" onClick={() => setDone(true)} type="button">
        {done ? "Guardado" : action}
      </button>
      {done ? <span className="pill green">Fluxo concluído em modo mock</span> : null}
    </aside>
  );
}
