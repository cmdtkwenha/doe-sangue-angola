"use client";

import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { EmptyState } from "../ui/EmptyState";
import styles from "./mobileGamification.module.css";
import { RewardBadge } from "./RewardBadge";
import {
  isDonorProfileComplete,
  useCurrentDonor
} from "./useCurrentDonor";
import { useAuth } from "../auth/useAuth";

export function RewardsPanel() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["rewards", "donor_responses", "donors"]);
  const { session } = useAuth();
  const { data: donor } = useCurrentDonor();
  const userId = session?.user.authUserId ?? session?.user.id;
  const current = isDonorProfileComplete(donor, userId) ? donor : null;
  const { data: rewards } = useApiData<Array<{ points: number }>>(
    current ? `/api/rewards?donorId=${current.id}` : "/api/rewards?donorId=missing",
    [],
    version + liveVersion
  );
  if (!current) {
    return <EmptyState title="Sem recompensas" message="Complete o perfil para acumular pontos reais." />;
  }
  const points = rewards.reduce((sum, item) => sum + item.points, current.points);
  const progress = rewardProgress(points);

  return (
    <section className={styles.panel}>
      <div>
        <small>Seus pontos</small>
        <h2>{points.toLocaleString("pt-AO")} pts</h2>
      </div>
      <div className={styles.progress}>
        <span />
      </div>
      <p className="muted">
        Faltam {progress.pointsToNext} pontos para {progress.nextTier}
      </p>
      <div className={styles.badgeGrid}>
        {progress.tiers.map((tier) => (
          <RewardBadge
            active={points >= tier.points}
            name={tier.name}
            points={tier.points}
            key={tier.name}
          />
        ))}
      </div>
    </section>
  );
}

function rewardProgress(points: number) {
  const tiers = [
    { name: "Bronze", points: 0 },
    { name: "Prata", points: 500 },
    { name: "Ouro", points: 1000 },
    { name: "Platina", points: 2000 }
  ];
  const next = tiers.find((item) => item.points > points);
  return { nextTier: next?.name ?? "Nível máximo", pointsToNext: next ? next.points - points : 0, tiers };
}
