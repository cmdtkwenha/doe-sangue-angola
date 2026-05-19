import { EmptyState } from "../ui/EmptyState";
import { provinceLeaderboard } from "./mobileDonorAgents";
import styles from "./mobileGamification.module.css";
import { canUseDevelopmentMock } from "./useCurrentDonor";

export function ProvinceLeaderboard() {
  if (!canUseDevelopmentMock()) {
    return (
      <EmptyState
        message="O ranking real será mostrado quando houver dadores suficientes na província."
        title="Ranking ainda vazio"
      />
    );
  }

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
