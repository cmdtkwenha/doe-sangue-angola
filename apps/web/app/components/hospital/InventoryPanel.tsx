import { inventory } from "@doe-sangue-angola/shared-services";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";

export function InventoryPanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Inventário de Sangue</strong>
        <a className="muted" href="/hospital/inventory">Ver detalhes</a>
      </div>
      {inventory.length === 0 ? (
        <EmptyState
          message="Registe unidades para acompanhar disponibilidade e reservas."
          title="Inventário vazio"
        />
      ) : (
        <div className={styles.table}>
          {inventory.map((item) => {
          const reserve = Math.max(item.safeMinimum - item.units, 0);
          const critical = item.units < item.safeMinimum;
          return (
          <article className={styles.inventoryRow} key={item.bloodType}>
            <strong>{item.bloodType}</strong>
            <span>{item.units} disponível</span>
            <span>{reserve} reserva</span>
            <span>{item.units + reserve} total</span>
            <span className={critical ? "pill red" : "pill gold"}>
              {critical ? "Crítico" : "Adequado"}
            </span>
          </article>
          );
          })}
        </div>
      )}
      <a className={styles.footerLink} href="/hospital/inventory">Ver inventário completo</a>
    </section>
  );
}
