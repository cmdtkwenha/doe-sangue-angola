import type { ReactNode } from "react";
import { RouteGuard } from "../auth/RouteGuard";
import { EmptyState } from "../ui/EmptyState";
import { HospitalHeader } from "./HospitalHeader";
import { HospitalSidebar } from "./HospitalSidebar";
import styles from "./hospitalPortal.module.css";

export function HospitalSectionPage({
  children,
  kicker = "Hospital Verificado",
  title
}: {
  children?: ReactNode;
  kicker?: string;
  title: string;
}) {
  return (
    <RouteGuard allowed={["hospital"]}>
      <main className={styles.portal} id="conteudo-principal" tabIndex={-1}>
        <HospitalSidebar />
        <section className={styles.content}>
          <HospitalHeader />
          <div className={styles.workspace}>
            <div>
              <p className="eyebrow">{kicker}</p>
              <h1 className={styles.title}>{title}</h1>
            </div>
            {children ?? (
              <EmptyState
                message="Esta área está pronta para receber dados reais do hospital."
                title="Sem dados para apresentar"
              />
            )}
          </div>
        </section>
      </main>
    </RouteGuard>
  );
}
