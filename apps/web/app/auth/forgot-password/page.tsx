import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";
import styles from "../../components/auth/auth.module.css";

export default function ForgotPasswordPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <aside className={styles.brand}>
          <div className={styles.drop} />
          <p className="eyebrow">Recuperação</p>
          <h1>Repor palavra-passe</h1>
          <p>
            Enviaremos um link seguro pelo Supabase para recuperar o acesso à
            plataforma.
          </p>
        </aside>
        <div className={styles.form}>
          <div className="eyebrow">Palavra-passe</div>
          <h2>Receber link de recuperação</h2>
          <p className="muted">Use o email associado à sua conta Doe Sangue Angola.</p>
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
