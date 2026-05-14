import Link from "next/link";
import styles from "../components/auth/auth.module.css";

export default function UnauthorizedPage() {
  return (
    <main className={styles.unauthorized}>
      <section className="panel" style={{ maxWidth: 520 }}>
        <div className="eyebrow">Acesso não autorizado</div>
        <h1 className="title">Este perfil não pode abrir esta área.</h1>
        <p className="muted">
          Termine a sessão e entre com o perfil correto para continuar.
        </p>
        <Link className="button" href="/auth">Voltar ao login</Link>
      </section>
    </main>
  );
}
