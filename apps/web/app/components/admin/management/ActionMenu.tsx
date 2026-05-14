"use client";

import styles from "./management.module.css";

export function ActionMenu({ actions, label }: { actions: string[]; label?: string }) {
  return (
    <select
      aria-label={label ?? "Ações"}
      className={styles.menu}
      defaultValue=""
      onChange={(event) => {
        if (event.target.value) window.alert(`Ação simulada: ${event.target.value}`);
        event.target.value = "";
      }}
    >
      <option value="">Ações</option>
      {actions.map((action) => <option key={action}>{action}</option>)}
    </select>
  );
}
