import type { CSSProperties, ReactNode } from "react";
import styles from "./dashboardPrimitives.module.css";

type Tone = "danger" | "gold" | "green" | "neutral";

export function KpiCard({
  icon,
  label,
  meta,
  value
}: {
  icon?: ReactNode;
  label: string;
  meta?: string;
  value: ReactNode;
}) {
  return (
    <article className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{label}</span>
      {icon ? <span className={styles.kpiIcon}>{icon}</span> : null}
      <strong className={styles.kpiValue}>{value}</strong>
      {meta ? <small className={styles.kpiMeta}>{meta}</small> : null}
    </article>
  );
}

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return <span className={`${styles.statusBadge} ${styles[tone]}`}>{label}</span>;
}

export function ActionButton({
  children,
  tone = "neutral",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button className={`${styles.actionButton} ${styles[tone]}`} type="button" {...props}>
      {children}
    </button>
  );
}

export function CompactTable({
  children,
  columns
}: {
  children: ReactNode;
  columns?: string;
}) {
  return (
    <div className={styles.compactTable} style={columns ? { "--cols": columns } as CSSProperties : undefined}>
      {children}
    </div>
  );
}

export function ModalLayout({
  actions,
  children,
  title
}: {
  actions?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <section className={styles.modalLayout}>
      <header>
        <h3>{title}</h3>
      </header>
      <div className={styles.modalBody}>{children}</div>
      {actions ? <footer className={styles.modalActions}>{actions}</footer> : null}
    </section>
  );
}

export function MobileCard({ children }: { children: ReactNode }) {
  return <article className={styles.mobileCard}>{children}</article>;
}
