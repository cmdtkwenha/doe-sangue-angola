"use client";

import { useState } from "react";
import type { SettingRow } from "./settingsData";
import { SettingsToggle } from "./SettingsToggle";
import styles from "./settings.module.css";

export function SettingsRow({ row }: { row: SettingRow }) {
  const [message, setMessage] = useState("");

  return (
    <div className={styles.row}>
      <div>
        <strong>{row.label}</strong>
        <p className="muted">{row.description}</p>
        {message ? <p className="muted" role="status">{message}</p> : null}
      </div>
      {row.type === "toggle" ? <SettingsToggle label={row.label} value={row.value} /> : null}
      {row.type === "value" ? <span className={styles.value}>{row.value}</span> : null}
      {row.type === "button" ? (
        <button
          className={`${styles.value} ${row.tone === "danger" ? styles.danger : ""}`}
          onClick={() => setMessage(`${row.label}: ação registada em modo mock.`)}
          type="button"
        >
          {row.value}
        </button>
      ) : null}
    </div>
  );
}
