import { inventory } from "@doe-sangue-angola/shared-services";
import { MobileTable } from "../ui/MobileTable";
import styles from "./adminCore.module.css";

export function BloodInventoryTable() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Inventário de Sangue</strong>
        <a className="muted" href="#">Ver detalhes</a>
      </div>
      <MobileTable
        columns={["Tipo", "Unidades", "Nível", "Estado"]}
        rows={inventory.map((item) => {
          const percent = Math.min(100, Math.round((item.units / item.safeMinimum) * 100));
          const low = item.units < item.safeMinimum;
          return {
            id: item.bloodType,
            cells: [
              <strong key="type">{item.bloodType}</strong>,
              `${item.units} unidades`,
              <div className={styles.bar} key="bar"><span style={{ width: `${percent}%` }} /></div>,
              <span className={low ? "pill red" : "pill"} key="status">
                {low ? "Crítico" : "Adequado"}
              </span>
            ]
          };
        })}
      />
    </section>
  );
}
