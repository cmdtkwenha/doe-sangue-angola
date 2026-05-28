import styles from "./support.module.css";

const steps = {
  admin: [
    "Confirme a saúde do sistema e hospitais importados.",
    "Acompanhe pedidos urgentes e dadores aceites.",
    "Revise alertas, auditoria e problemas reportados."
  ],
  donor: [
    "Complete o perfil com tipo sanguíneo e localização.",
    "Abra pedidos disponíveis e confirme o hospital.",
    "Aceite, guarde o PIN e apresente-o no hospital."
  ],
  hospital: [
    "Ligue a conta a um hospital aprovado.",
    "Crie pedido urgente com tipo sanguíneo e bolsas.",
    "Confirme chegada, valide PIN e conclua a doação."
  ]
};

export function OperationalWalkthrough({ role }: { role: keyof typeof steps }) {
  return (
    <section className={styles.panel}>
      <div>
        <div className="eyebrow">Primeiro uso</div>
        <h2>Guia rápido {label(role)}</h2>
      </div>
      <div className={styles.steps}>
        {steps[role].map((step, index) => (
          <article className={styles.step} key={step}>
            <strong>{index + 1}. {step}</strong>
            <span className="muted">Complete este passo antes de avançar no piloto.</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function label(role: keyof typeof steps) {
  if (role === "admin") return "do admin";
  if (role === "hospital") return "do hospital";
  return "do dador";
}
