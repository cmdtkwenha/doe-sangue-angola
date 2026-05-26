"use client";

import { useState } from "react";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useApiData } from "@hooks/useApiData";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { EmptyState } from "../ui/EmptyState";
import styles from "./mobileApp.module.css";
import { shortcuts } from "./mobileMock";
import { MobileHeader } from "./MobileHeader";
import { MobileShell } from "./MobileShell";
import { DonorPinCard } from "./DonorPinCard";
import { isDonorProfileComplete, useCurrentDonor } from "./useCurrentDonor";
import { useAuth } from "../auth/useAuth";

export function DonorHome() {
  const [message, setMessage] = useState("Atalhos prontos.");
  const version = useRealtimeVersion();
  const { session } = useAuth();
  const { data: donor, loading } = useCurrentDonor();
  const userId = session?.user.authUserId ?? session?.user.id;
  const donorId = donor?.id ?? "";
  const { data: nearbyRequests } = useApiData<BloodRequest[]>(
    donorId ? `/api/blood-requests?donorId=${donorId}` : "/api/blood-requests?donorId=missing",
    [],
    version
  );
  if (!isDonorProfileComplete(donor, userId)) {
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
            onClick={() => setMessage(`${label} aberto.`)}
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
        <strong>Elegibilidade</strong>
        <p className="muted">{donor.eligibilityStatus ?? "Pendente"} · {donor.totalDonations ?? 0} doações registadas</p>
        <progress className={styles.progress} max="2000" value={donor.points} />
      </article>
      <DonorPinCard />
      <article className={styles.card}>
        <strong>Necessidades urgentes na sua área</strong>
        <div className={styles.requestTop}>
          <span className={`${styles.blood} ${styles.criticalText}`}>
            {nearbyRequests[0]?.bloodType ?? donor.bloodType}
          </span>
          <span>
            <strong>{nearbyRequests[0] ? nearbyRequests[0].urgency : "SEM PEDIDOS"}</strong>
            <br />
            <small>{donor.province}</small>
          </span>
          <span>›</span>
        </div>
      </article>
    </MobileShell>
  );
}
