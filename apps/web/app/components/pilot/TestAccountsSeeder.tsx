"use client";

import { pilotAccounts, seedPilotAccounts } from "@doe-sangue-angola/shared-services";
import { useState } from "react";
import styles from "./pilot.module.css";

export function TestAccountsSeeder() {
  const [message, setMessage] = useState("Contas ainda não preparadas nesta sessão.");

  return (
    <section className={styles.panel}>
      <div className="eyebrow">Onboarding piloto</div>
      <h2>Contas de teste</h2>
      <div className={styles.accounts}>
        {pilotAccounts.map((account) => (
          <article className={styles.account} key={account.email}>
            <span>
              <strong>{account.name}</strong>
              <br />
              <small className="muted">{account.email} · {account.province}</small>
            </span>
            <span className="pill">{account.role}</span>
          </article>
        ))}
      </div>
      <button
        className="button"
        onClick={() => setMessage(seedPilotAccounts().message)}
        type="button"
      >
        Preparar contas piloto
      </button>
      <p className="muted">{message}</p>
    </section>
  );
}
