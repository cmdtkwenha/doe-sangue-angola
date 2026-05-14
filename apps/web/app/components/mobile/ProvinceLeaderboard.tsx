import { provinceLeaderboard } from "./mobileDonorAgents";
import styles from "./mobileGamification.module.css";

export function ProvinceLeaderboard() {
  return (
    <section className={styles.panel}>
      <strong>Ranking da Província</strong>
      {provinceLeaderboard.map(([rank, name, province, points]) => (
        <article className={styles.leaderRow} key={name}>
          <strong>{rank}</strong>
          <span>
            <strong>{name}</strong>
            <br />
            <small className="muted">{province}</small>
          </span>
          <span className="pill gold">{points}</span>
        </article>
      ))}
    </section>
  );
}
