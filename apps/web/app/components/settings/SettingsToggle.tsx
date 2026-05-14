"use client";

import { useState } from "react";
import styles from "./settings.module.css";

export function SettingsToggle({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  const [enabled, setEnabled] = useState(value === "on");

  return (
    <button
      aria-label={`${label}: ${enabled ? "ativado" : "desativado"}`}
      aria-pressed={enabled}
      className={`${styles.toggle} ${enabled ? styles.toggleOn : ""}`}
      onClick={() => setEnabled((item) => !item)}
      type="button"
    />
  );
}
