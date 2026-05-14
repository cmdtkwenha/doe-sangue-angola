"use client";

import { useState } from "react";
import styles from "./mobileSafety.module.css";

const items = ["Pedidos urgentes", "Lembretes de elegibilidade", "Agendamentos", "Recompensas"];

export function NotificationSettings() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((item) => [item, true]))
  );

  return (
    <section className={styles.section}>
      <strong>Notificações</strong>
      {items.map((item) => (
        <label className={styles.row} key={item}>
          <span>{item}</span>
          <input
            className={styles.toggle}
            checked={enabled[item]}
            onChange={(event) => setEnabled({ ...enabled, [item]: event.target.checked })}
            type="checkbox"
          />
        </label>
      ))}
    </section>
  );
}
