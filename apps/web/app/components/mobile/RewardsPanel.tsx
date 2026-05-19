"use client";

import { rewardAgent } from "@doe-sangue-angola/agents";
import { listDonors } from "@doe-sangue-angola/shared-services";
import type { Donor } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useMemo } from "react";
import styles from "./mobileGamification.module.css";
import { RewardBadge } from "./RewardBadge";

export function RewardsPanel() {
  const version = useRealtimeVersion();
  const fallback = useMemo(() => listDonors(), [version]);
  const { data: donors } = useApiData<Donor[]>("/api/donors", fallback, version);
  const rewards = rewardAgent(donors[0] ?? fallback[0], false);

  return (
    <section className={styles.panel}>
      <div>
        <small>Seus pontos</small>
        <h2>{rewards.currentPoints.toLocaleString("pt-AO")} pts</h2>
      </div>
      <div className={styles.progress}>
        <span />
      </div>
      <p className="muted">
        Faltam {rewards.pointsToNext} pontos para {rewards.nextTier}
      </p>
      <div className={styles.badgeGrid}>
        {rewards.tiers.map((tier) => (
          <RewardBadge
            active={rewards.currentPoints >= tier.points}
            name={tier.name}
            points={tier.points}
            key={tier.name}
          />
        ))}
      </div>
    </section>
  );
}
