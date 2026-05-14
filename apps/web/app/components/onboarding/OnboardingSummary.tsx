import styles from "./onboarding.module.css";

export function OnboardingSummary({
  action,
  fields,
  title
}: {
  action: string;
  fields: Array<[string, string]>;
  title: string;
}) {
  return (
    <aside className={styles.summary}>
      <div>
        <div className="eyebrow">Dados mock</div>
        <h2>{title}</h2>
      </div>
      <div className={styles.fieldGrid}>
        {fields.map(([label, value]) => (
          <div className={styles.field} key={label}>
            <span className="muted">{label}</span>
            <br />
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <button className="button" type="button">{action}</button>
    </aside>
  );
}
