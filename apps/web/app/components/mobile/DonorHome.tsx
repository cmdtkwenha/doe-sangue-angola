import styles from "./mobileApp.module.css";
import { donor, shortcuts } from "./mobileMock";
import { MobileHeader } from "./MobileHeader";
import { MobileShell } from "./MobileShell";

export function DonorHome() {
  return (
    <MobileShell active="home">
      <MobileHeader title="Sangue Angola" subtitle="Doe sangue, salve vidas" />
      <section className={styles.hero}>
        <h2>Olá, Maria!</h2>
        <p>Obrigado por fazer a diferença.</p>
        <div className={styles.heroMeta}>
          <span><small>Pontos</small><br /><strong className={styles.points}>{donor.points}</strong></span>
          <span><small>Seu Nível</small><br /><strong className={styles.level}>{donor.level}</strong></span>
          <span className={styles.medal}>★</span>
        </div>
      </section>
      <section className={styles.shortcutGrid}>
        {shortcuts.map(([label, badge]) => (
          <button
            aria-label={badge ? `${label}, ${badge} novidades` : label}
            className={styles.shortcut}
            key={label}
            type="button"
          >
            <span aria-hidden="true">{label === "Pedidos" ? "◆" : "▣"}</span>
            {badge ? <span className={styles.badge}>{badge}</span> : null}
            <small>{label}</small>
          </button>
        ))}
      </section>
      <article className={styles.card}>
        <strong>Próxima conquista</strong>
        <p className="muted">{donor.nextLevel}</p>
        <progress className={styles.progress} max="2000" value="1250" />
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
