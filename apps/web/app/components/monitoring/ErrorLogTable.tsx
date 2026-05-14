import { listErrorLogs } from "@doe-sangue-angola/shared-services";
import styles from "./monitoring.module.css";

export function ErrorLogTable() {
  const errors = listErrorLogs().slice(0, 6);

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Erros e Ações Falhadas</strong>
        <span className={errors.length ? "pill red" : "pill green"}>
          {errors.length ? "Requer revisão" : "Sem erros"}
        </span>
      </div>
      {errors.length ? errors.map((error) => (
        <article className={styles.row} key={error.id}>
          <span>{new Date(error.time).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>
          <span>
            <strong>{error.type}</strong>
            <br />
            <small className="muted">{error.message}</small>
          </span>
          <span className={`${styles.status} ${styles.error}`}>Erro</span>
        </article>
      )) : (
        <p className="muted">Nenhuma falha registada no modo demonstração.</p>
      )}
    </section>
  );
}
