"use client";

import { useState } from "react";
import styles from "./management.module.css";

export function ActionMenu({ actions, label, onAction }: {
  actions: string[];
  label?: string;
  onAction?: (action: string) => void;
}) {
  const [message, setMessage] = useState("");

  return (
    <span>
      <select
        aria-label={label ?? "Ações"}
        className={styles.menu}
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) {
            onAction?.(event.target.value);
            setMessage(`${event.target.value} registado.`);
          }
          event.target.value = "";
        }}
      >
        <option value="">Ações</option>
        {actions.map((action) => <option key={action}>{action}</option>)}
      </select>
      {message ? <small className="muted" role="status">{message}</small> : null}
    </span>
  );
}
