import Link from "next/link";
import { SupportContactSection } from "../components/support";
import styles from "./legal.module.css";

export function LegalPage({ children, title }: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <main className={styles.shell}>
      <article className={styles.article}>
        <Link href="/help">← Centro de ajuda</Link>
        <div>
          <p className="eyebrow">Legal e privacidade</p>
          <h1>{title}</h1>
          <p className="muted">Versão piloto v1 · Português</p>
        </div>
        {children}
        <SupportContactSection />
      </article>
    </main>
  );
}

export function LegalSection({ items, title }: { items: string[]; title: string }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      <ul className={styles.list}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export { styles as legalStyles };
