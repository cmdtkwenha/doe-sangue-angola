import type { ReactNode } from "react";
import styles from "./mobileApp.module.css";
import { BottomNav } from "./BottomNav";

export function MobileShell({
  active,
  children
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <article className={styles.phone} id={active}>
      <section className={styles.screen}>
        <div className={styles.status}>
          <span>9:41</span>
          <span>●●● 5G ▰</span>
        </div>
        {children}
        <BottomNav active={active} />
      </section>
    </article>
  );
}
