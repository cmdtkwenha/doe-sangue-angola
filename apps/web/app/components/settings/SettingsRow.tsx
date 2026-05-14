import type { SettingRow } from "./settingsData";
import { SettingsToggle } from "./SettingsToggle";
import styles from "./settings.module.css";

export function SettingsRow({ row }: { row: SettingRow }) {
  return (
    <div className={styles.row}>
      <div>
        <strong>{row.label}</strong>
        <p className="muted">{row.description}</p>
      </div>
      {row.type === "toggle" ? <SettingsToggle label={row.label} value={row.value} /> : null}
      {row.type === "value" ? <span className={styles.value}>{row.value}</span> : null}
      {row.type === "button" ? (
        <button
          className={`${styles.value} ${row.tone === "danger" ? styles.danger : ""}`}
          type="button"
        >
          {row.value}
        </button>
      ) : null}
    </div>
  );
}
