import styles from "./hospitalPortal.module.css";

export function UrgentRequestCard() {
  return (
    <article className={styles.urgent}>
      <span className={styles.bolt}>!</span>
      <div>
        <strong>Solicitação Urgente com 1 Clique</strong>
        <p className="muted">Crie um pedido urgente e notifique dadores compatíveis.</p>
        <button className="button" type="button">CRIAR PEDIDO URGENTE</button>
      </div>
    </article>
  );
}
