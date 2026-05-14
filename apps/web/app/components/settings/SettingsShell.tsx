import Link from "next/link";
import type { UserRole } from "@doe-sangue-angola/shared-types";
import { getRedirectForRole } from "@doe-sangue-angola/shared-services";
import { SettingsSection } from "./SettingsSection";
import { settingsData, settingsTitles } from "./settingsData";
import styles from "./settings.module.css";

export function SettingsShell({ role }: { role: UserRole }) {
  const [title, subtitle] = settingsTitles[role];
  const sections = settingsData[role];

  return (
    <main className={styles.shell} id="conteudo-principal" tabIndex={-1}>
      <header className={styles.header}>
        <div>
          <div className="eyebrow">Definições • Doe Sangue Angola</div>
          <h1 className="title">{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>
        <Link className="button" href={getRedirectForRole(role)}>
          Voltar ao painel
        </Link>
      </header>
      <div className={styles.layout}>
        <nav aria-label="Secções de definições" className={styles.panel}>
          {sections.map((section, index) => (
            <a
              className={`${styles.tab} ${index === 0 ? styles.tabActive : ""}`}
              href={`#${section.title}`}
              key={section.title}
            >
              {section.title}
            </a>
          ))}
        </nav>
        <div className={styles.grid}>
          {sections.map((section) => (
            <SettingsSection key={section.title} section={section} />
          ))}
        </div>
      </div>
    </main>
  );
}
