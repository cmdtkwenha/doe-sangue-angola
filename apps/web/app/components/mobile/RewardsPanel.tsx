import { rewards } from "./mobileDonorAgents";
import styles from "./mobileGamification.module.css";
import { RewardBadge } from "./RewardBadge";

export function RewardsPanel() {
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
