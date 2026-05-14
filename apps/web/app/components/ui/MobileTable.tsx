import type { ReactNode } from "react";
import styles from "./responsive.module.css";

export type MobileTableRow = {
  cells: ReactNode[];
  id: string;
};

export function MobileTable({
  columns,
  rows
}: {
  columns: string[];
  rows: MobileTableRow[];
}) {
  return (
    <div className={styles.table}>
      {rows.map((row) => (
        <article
          className={styles.row}
          key={row.id}
          style={{ "--mobile-table-columns": `repeat(${columns.length}, 1fr)` } as React.CSSProperties}
        >
          {row.cells.map((cell, index) => (
            <span className={styles.cell} key={`${row.id}-${columns[index]}`}>
              <span className={styles.label}>{columns[index]}</span>
              {cell}
            </span>
          ))}
        </article>
      ))}
    </div>
  );
}
