"use client";

import { useState } from "react";
import { listDonors } from "@doe-sangue-angola/shared-services";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import styles from "./mobileApp.module.css";
import { donor as donorMock, shortcuts } from "./mobileMock";
import { MobileHeader } from "./MobileHeader";
import { MobileShell } from "./MobileShell";

export function DonorHome() {
  const [message, setMessage] = useState("Atalhos prontos.");
  useRealtimeVersion();
  const donor = listDonors()[0];
  const points = donor.points.toLocaleString("pt-AO");
  const level = donor.points >= 2000 ? "PLATINA" : donor.points >= 1000 ? "OURO" : "PRATA";

  return (
    <MobileShell active="home">
      <MobileHeader title="Sangue Angola" subtitle="Doe sangue, salve vidas" />
      <section className={styles.hero}>
        <h2>Olá, Maria!</h2>
        <p>Obrigado por fazer a diferença.</p>
        <div className={styles.heroMeta}>
          <span><small>Pontos</small><br /><strong className={styles.points}>{points}</strong></span>
          <span><small>Seu Nível</small><br /><strong className={styles.level}>{level}</strong></span>
          <span className={styles.medal}>★</span>
        </div>
      </section>
      <section className={styles.shortcutGrid}>
        {shortcuts.map(([label, badge]) => (
          <button
            aria-label={badge ? `${label}, ${badge} novidades` : label}
            className={styles.shortcut}
            key={label}
            onClick={() => setMessage(`${label} aberto em modo mock.`)}
            type="button"
          >
            <span aria-hidden="true">{label === "Pedidos" ? "◆" : "▣"}</span>
            {badge ? <span className={styles.badge}>{badge}</span> : null}
            <small>{label}</small>
          </button>
        ))}
      </section>
      <p className="muted" role="status">{message}</p>
      <article className={styles.card}>
        <strong>Próxima conquista</strong>
        <p className="muted">{donorMock.nextLevel}</p>
        <progress className={styles.progress} max="2000" value={donor.points} />
      </article>
      <article className={styles.card}>
        <strong>Necessidades urgentes na sua área</strong>
        <div className={styles.requestTop}>
          <span className={`${styles.blood} ${styles.criticalText}`}>O-</span>
          <span><strong>MUITA FALTA</strong><br /><small>Luanda</small></span>
          <span>›</span>
        </div>
      </article>
    </MobileShell>
  );
}
