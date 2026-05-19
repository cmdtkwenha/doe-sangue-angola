"use client";

import { getAuthMode, getDataMode } from "@doe-sangue-angola/shared-services";
import styles from "./auth.module.css";

export function AuthModeDebug() {
  const authMode = getAuthMode() === "supabase" ? "supabase" : "mock";
  const dataMode = getDataMode();

  return (
    <div className={styles.envDebug} aria-label="Modo ativo da plataforma">
      <span>AUTH MODE: {authMode}</span>
      <span>DATA MODE: {dataMode}</span>
    </div>
  );
}
