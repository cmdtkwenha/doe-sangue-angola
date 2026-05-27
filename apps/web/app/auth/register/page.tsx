import { RegisterForm } from "../../components/auth/RegisterForm";
import styles from "../../components/auth/auth.module.css";

export default function RegisterPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <aside className={styles.brand}>
          <div className={styles.drop} />
          <p className="eyebrow">Nova conta</p>
          <h1>Registo seguro</h1>
          <p>
            Crie uma conta com função definida. O perfil controla o acesso ao
            portal correto.
          </p>
        </aside>
        <div className={styles.form}>
          <div className="eyebrow">Registar</div>
          <h2>Escolha o perfil da conta</h2>
          <p className="muted">Admin, hospital ou dador serão redirecionados para a área correta.</p>
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
