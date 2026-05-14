import Link from "next/link";
import { getRedirectForRole } from "@doe-sangue-angola/shared-services";
import { ReportCard } from "./ReportCard";
import { ReportFilters } from "./ReportFilters";
import type { ReportRole } from "./reportsData";
import { reportsByRole } from "./reportsData";
import styles from "./reports.module.css";

const copy = {
  admin: [
    "Relatórios nacionais",
    "Pedidos, hospitais, dadores, escassez, fraude e auditoria."
  ],
  hospital: [
    "Relatórios do hospital",
    "Pedidos, doações recebidas, inventário e agendamentos."
  ]
} as const;

export function ReportsShell({ role }: { role: ReportRole }) {
  const [title, subtitle] = copy[role];

  return (
    <main className={styles.shell} id="conteudo-principal" tabIndex={-1}>
      <header className={styles.header}>
        <div>
          <div className="eyebrow">Reports • Doe Sangue Angola</div>
          <h1 className="title">{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>
        <Link className="button" href={getRedirectForRole(role)}>
          Voltar ao painel
        </Link>
      </header>
      <ReportFilters />
      <section className={styles.grid}>
        {reportsByRole[role].map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </section>
    </main>
  );
}
