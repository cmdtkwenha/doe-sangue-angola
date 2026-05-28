import { firstPilotAccounts, getFirstPilotDashboard } from "@doe-sangue-angola/shared-services";
import styles from "./pilot.module.css";

export function PilotDashboardSection() {
  const dashboard = getFirstPilotDashboard();

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className="eyebrow">Piloto real</div>
          <h2>Controlo da primeira sessão</h2>
        </div>
        <span className="pill gold">Pronto para teste</span>
      </div>
      <div className={styles.metrics}>
        <Metric label="Utilizadores" value={dashboard.users} />
        <Metric label="Hospitais" value={dashboard.hospitals} />
        <Metric label="Pedidos piloto" value={dashboard.requests} />
        <Metric label="Questões" value={dashboard.issues.length} />
      </div>
      <div className={styles.grid}>
        <div className={styles.accounts}>
          <strong>Contas piloto</strong>
          {firstPilotAccounts.map((account) => (
            <div className={styles.account} key={account.email}>
              <span>
                <strong>{account.name}</strong>
                <small>{account.email}</small>
              </span>
              <span className="pill">{roleLabel(account.role)}</span>
            </div>
          ))}
        </div>
        <div className={styles.accounts}>
          <strong>Questões a acompanhar</strong>
          {dashboard.issues.map((issue) => (
            <div className={styles.account} key={issue.id}>
              <span>
                <strong>{issue.title}</strong>
                <small>{issue.owner} · {issue.status}</small>
              </span>
              <span className={issue.priority === "Alta" ? "pill red" : "pill gold"}>
                {issue.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className={styles.metric}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function roleLabel(role: string) {
  if (role === "admin") return "Admin";
  if (role === "hospital") return "Hospital";
  return "Dador";
}
