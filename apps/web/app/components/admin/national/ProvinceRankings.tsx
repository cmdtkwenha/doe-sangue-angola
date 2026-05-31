import { EmptyState } from "../../ui/EmptyState";
import type { ProvinceRanking } from "./nationalTypes";
import styles from "./national.module.css";

export function ProvinceRankings({ rankings }: { rankings: ProvinceRanking[] }) {
  const max = Math.max(1, ...rankings.map((item) => item.donations + item.activeDonors));
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Ranking por Província</strong>
        <span className="muted">Doações, dadores e hospitais</span>
      </div>
      {!rankings.length ? (
        <EmptyState title="Sem ranking real" message="O ranking aparece após atividade piloto." />
      ) : (
        <div className={styles.list}>
          {rankings.map((item, index) => (
            <article className={styles.rankRow} key={item.province}>
              <strong>{index + 1}. {item.province}</strong>
              <div className={styles.stockBar}>
                <span style={{ width: `${Math.round(((item.donations + item.activeDonors) / max) * 100)}%` }} />
              </div>
              <small>{item.donations} doações · {item.activeDonors} dadores · {item.hospitals} hospitais</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
