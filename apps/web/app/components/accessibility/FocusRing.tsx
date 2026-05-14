import type { ReactNode } from "react";
import styles from "./accessibility.module.css";

export function FocusRing({ children }: { children: ReactNode }) {
  return <div className={styles.focusRing}>{children}</div>;
}
