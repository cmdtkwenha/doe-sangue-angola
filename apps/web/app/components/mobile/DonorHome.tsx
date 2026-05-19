"use client";

import { useState } from "react";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { EmptyState } from "../ui/EmptyState";
import styles from "./mobileApp.module.css";
import { shortcuts } from "./mobileMock";
import { MobileHeader } from "./MobileHeader";
import { MobileShell } from "./MobileShell";
import { isDonorProfileComplete, useCurrentDonor } from "./useCurrentDonor";

export function DonorHome() {
  const [message, setMessage] = useState("Atalhos prontos.");
  useRealtimeVersion();
  const { data: donor, loading } = useCurrentDonor();
  if (!isDonorProfileComplete(donor)) {
    return (
      <MobileShell active="home">
        <MobileHeader title="Sangue Angola" subtitle="Doe sangue, salve vidas" />
        <EmptyState
          message={loading ? "A carregar perfil do dador..." : "Complete o onboarding para ver pedidos e recompensas reais."}
          title={loading ? "A sincronizar" : "Perfil de dador em falta"}
        />
      </MobileShell>
    );
  }
  const points = donor.points.toLocaleString("pt-AO");
  const level = donor.points >= 2000 ? "PLATINA" : donor.points >= 1000 ? "OURO" : "PRATA";
  const firstName = donor.name.split(" ")[0] || "Dador";

  return (
    <MobileShell active="home">
      <MobileHeader title="Sangue Angola" subtitle="Doe sangue, salve vidas" />
      <section className={styles.hero}>
        <h2>Olá, {firstName}!</h2>
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
        <p className="muted">Continue a doar para subir de nível.</p>
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
