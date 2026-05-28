import Link from "next/link";
import { SupportContactSection, SupportIssueForm } from "../components/support";
import styles from "./help.module.css";

const articles = [
  ["Como doar sangue", "/help/como-doar-sangue"],
  ["Como validar PIN", "/help/como-validar-pin"],
  ["Como criar pedido urgente", "/help/como-criar-pedido-urgente"],
  ["Perguntas Frequentes", "/help/perguntas-frequentes"]
];

export default function HelpPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.content}>
        <header className={styles.hero}>
          <p className="eyebrow">Centro de ajuda</p>
          <h1>Suporte operacional Doe Sangue Angola</h1>
          <p className="muted">
            Guias rápidos para dadores, hospitais e administradores durante o piloto.
          </p>
        </header>
        <div className={styles.grid}>
          {articles.map(([title, href]) => (
            <Link className={styles.link} href={href} key={href}>
              <strong>{title}</strong>
              <span className="muted">Abrir guia passo a passo</span>
            </Link>
          ))}
        </div>
        <SupportContactSection />
        <article className={styles.card}>
          <h2>Reportar Problema</h2>
          <SupportIssueForm action="help-center" page="/help" role="donor" />
        </article>
      </section>
    </main>
  );
}
