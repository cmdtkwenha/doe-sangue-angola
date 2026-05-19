import { AuthModeDebug } from "../components/auth/AuthModeDebug";
import { LoginForm } from "../components/auth/LoginForm";
import styles from "../components/auth/auth.module.css";

export default function AuthPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <aside className={styles.brand}>
          <div className={styles.drop} />
          <p className="eyebrow">Doe Sangue Angola</p>
          <h1>Acesso seguro à plataforma nacional</h1>
          <p>
            Entre com a sua conta Supabase. O perfil guardado define
            automaticamente o portal correto.
          </p>
        </aside>
        <div className={styles.form}>
          <div className="eyebrow">Entrar</div>
          <h2>Selecione o seu perfil</h2>
          <p className="muted">
            Admin, hospitais e dadores entram pelo mesmo ponto com sessão
            persistente e acesso protegido.
          </p>
          <AuthModeDebug />
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
