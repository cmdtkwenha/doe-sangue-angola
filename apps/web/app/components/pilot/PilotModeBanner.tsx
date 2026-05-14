import { pilotConfig } from "@doe-sangue-angola/shared-services";
import styles from "./pilot.module.css";

export function PilotModeBanner() {
  return (
    <section className={styles.banner}>
      <div>
        <div className="eyebrow">Modo piloto</div>
        <strong>Teste controlado em Luanda e Benguela</strong>
        <p className="muted" style={{ margin: "6px 0 0" }}>
          Notificações seguras, contas de teste e dados mock continuam ativos por defeito.
        </p>
      </div>
      <span className={pilotConfig.enabled ? "pill green" : "pill gold"}>
        {pilotConfig.enabled ? "Piloto ativo" : "Pronto para piloto"}
      </span>
    </section>
  );
}
