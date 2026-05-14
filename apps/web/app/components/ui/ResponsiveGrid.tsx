import type { ReactNode } from "react";
import styles from "./responsive.module.css";

export function ResponsiveGrid({
  children,
  min = 240
}: {
  children: ReactNode;
  min?: number;
}) {
  return (
    <div
      className={styles.grid}
      style={{ "--responsive-min": `${min}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
