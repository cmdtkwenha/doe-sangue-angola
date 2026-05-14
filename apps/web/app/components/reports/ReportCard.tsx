import { ReportExportButtons } from "./ReportExportButtons";
import { ReportTable } from "./ReportTable";
import type { ReportDefinition } from "./reportsData";
import styles from "./reports.module.css";

export function ReportCard({ report }: { report: ReportDefinition }) {
  return (
    <article className={styles.card}>
      <div className="eyebrow">Relatório</div>
      <h2>{report.title}</h2>
      <p className="muted">{report.description}</p>
      <div className={styles.summary}>
        {report.summary.map(([label, value]) => (
          <div className={styles.summaryItem} key={label}>
            <span className="muted">{label}</span>
            <h3>{value}</h3>
          </div>
        ))}
      </div>
      <ReportExportButtons filename={`${report.id}.csv`} rows={report.rows} />
      <ReportTable rows={report.rows} />
    </article>
  );
}
