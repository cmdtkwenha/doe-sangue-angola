import { SettingsRow } from "./SettingsRow";
import type { SettingSection } from "./settingsData";
import styles from "./settings.module.css";

export function SettingsSection({ section }: { section: SettingSection }) {
  return (
    <section className={styles.section}>
      <div className="eyebrow">{section.eyebrow}</div>
      <h2>{section.title}</h2>
      {section.rows.map((row) => (
        <SettingsRow key={row.label} row={row} />
      ))}
    </section>
  );
}
