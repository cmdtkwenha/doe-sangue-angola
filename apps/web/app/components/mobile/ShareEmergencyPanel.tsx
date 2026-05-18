"use client";

import { getFamilyEmergency } from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import styles from "./familyEmergency.module.css";

export function ShareEmergencyPanel() {
  const emergency = getFamilyEmergency();
  const [message, setMessage] = useState("");
  const copy = async () => {
    await navigator.clipboard?.writeText(emergency.shareLink);
    setMessage("Link copiado.");
  };

  return (
    <section className={styles.panel}>
      <strong>Partilhar pedido</strong>
      <div className={styles.shareBox}>
        <span className="muted">Link público temporário</span>
        <span className={styles.link}>{emergency.shareLink}</span>
        <span>{emergency.agent.shareText}</span>
      </div>
      <button className="button" onClick={() => void copy()} style={{ width: "100%", marginTop: 12 }} type="button">
        Copiar link
      </button>
      {message ? <span className="pill green">{message}</span> : null}
    </section>
  );
}
