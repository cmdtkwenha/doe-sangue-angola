import Link from "next/link";
import { SupportContactSection } from "../components/support";
import styles from "./help.module.css";

export function HelpArticle({ steps, title }: { steps: string[]; title: string }) {
  return (
    <main className={styles.shell}>
      <article className={`${styles.content} ${styles.card}`}>
        <Link href="/help">← Voltar ao centro de ajuda</Link>
        <div>
          <p className="eyebrow">Guia operacional</p>
          <h1>{title}</h1>
        </div>
        <ol className={styles.steps}>
          {steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <SupportContactSection />
      </article>
    </main>
  );
}
