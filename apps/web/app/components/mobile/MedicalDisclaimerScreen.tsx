import styles from "./mobileSafety.module.css";

export function MedicalDisclaimerScreen() {
  return (
    <section className={styles.section}>
      <strong>Segurança Médica</strong>
      <div className={styles.notice}>
        <strong>Antes de doar</strong>
        <span>Não doe se estiver doente, febril, medicado sem orientação ou sem se sentir bem.</span>
      </div>
      <p className={styles.finePrint}>
        O Doe Sangue Angola ajuda a encontrar pedidos e organizar agendamentos.
        A avaliação de elegibilidade é feita pela equipa clínica no local.
      </p>
    </section>
  );
}
