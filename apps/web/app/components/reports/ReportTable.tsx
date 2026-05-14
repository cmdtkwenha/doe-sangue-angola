import styles from "./reports.module.css";

export function ReportTable({ rows }: { rows: Record<string, string>[] }) {
  const headers = Object.keys(rows[0] ?? {});

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header) => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => <td key={header}>{row[header]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
