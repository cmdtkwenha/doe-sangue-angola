"use client";

import { rewardAgent } from "@doe-sangue-angola/agents";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { EmptyState } from "../ui/EmptyState";
import styles from "./mobileGamification.module.css";
import { RewardBadge } from "./RewardBadge";
import {
  isDonorProfileComplete,
  useCurrentDonor
} from "./useCurrentDonor";
import { useAuth } from "../auth/useAuth";

export function RewardsPanel() {
  useRealtimeVersion();
  const { session } = useAuth();
  const { data: donor } = useCurrentDonor();
  const userId = session?.user.authUserId ?? session?.user.id;
  const current = isDonorProfileComplete(donor, userId) ? donor : null;
  if (!current) {
    return <EmptyState title="Sem recompensas" message="Complete o perfil para acumular pontos reais." />;
  }
  const rewards = rewardAgent(current, false);

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
