import { SocialSharePanel } from "../social/SocialSharePanel";
import styles from "../ui/polish.module.css";
import { MobileShell } from "./MobileShell";

export function DonationSuccessScreen() {
  return (
    <MobileShell active="donations">
      <section className={styles.successCard}>
        <span className={styles.successPulse}>✓</span>
        <h2>Doação concluída</h2>
        <p className="muted">
          O hospital validou o seu PIN. Obrigado por ajudar a salvar vidas.
        </p>
      </section>
      <section className={styles.rewardCard}>
        <div className="eyebrow">Recompensa desbloqueada</div>
        <h2>+120 pontos</h2>
        <p>Subiu no progresso para Platina.</p>
      </section>
      <SocialSharePanel />
    </MobileShell>
  );
}
