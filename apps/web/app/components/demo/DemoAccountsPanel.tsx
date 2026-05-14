import { demoAccounts } from "@doe-sangue-angola/shared-services";
import styles from "./demo.module.css";

export function DemoAccountsPanel() {
  return (
    <section className={styles.accounts}>
      <div>
        <div className="eyebrow">Contas demo</div>
        <h3>Acesso para apresentação</h3>
      </div>
      <div className={styles.accountGrid}>
        {demoAccounts.map((account) => (
          <article className={styles.account} key={account.email}>
            <strong>{account.label}</strong>
            <span>{account.email}</span>
            <small>Senha: {account.password}</small>
            <small className="muted">{account.route}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
