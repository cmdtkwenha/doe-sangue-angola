import styles from "./mobileGamification.module.css";

const tone: Record<string, string> = {
  Bronze: styles.bronze,
  Prata: styles.silver,
  Ouro: styles.gold,
  Platina: styles.platinum
};

export function RewardBadge({
  active,
  name,
  points
}: {
  active: boolean;
  name: string;
  points: number;
}) {
  return (
    <article className={styles.badge} style={{ opacity: active ? 1 : 0.45 }}>
      <span className={`${styles.badgeIcon} ${tone[name]}`}>★</span>
      <strong>{name}</strong>
      <small className="muted">{points} pts</small>
    </article>
  );
}
