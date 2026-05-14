import type { ReactNode } from "react";
import { RouteGuard } from "../../auth/RouteGuard";
import { AdminHeader } from "../AdminHeader";
import { AdminSidebar } from "../AdminSidebar";
import styles from "../adminCore.module.css";

export function AdminManagementPage({
  children,
  kicker,
  title
}: {
  children: ReactNode;
  kicker: string;
  title: string;
}) {
  return (
    <RouteGuard allowed={["admin"]}>
      <main className={styles.shell}>
        <AdminSidebar />
        <section className={styles.content}>
          <AdminHeader />
          <div className={styles.workspace}>
            <p className="eyebrow">{kicker}</p>
            <h1 className={styles.title}>{title}</h1>
            {children}
          </div>
        </section>
      </main>
    </RouteGuard>
  );
}
