"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { NotificationBell } from "../notifications/NotificationBell";
import appStyles from "./mobileApp.module.css";
import styles from "./mobilePwa.module.css";

export type MobileTab = "home" | "requests" | "pin" | "history" | "profile";

const tabs: Array<{ id: MobileTab; icon: string; label: string }> = [
  { id: "home", icon: "⌂", label: "Início" },
  { id: "requests", icon: "◆", label: "Pedidos" },
  { id: "pin", icon: "●", label: "PIN" },
  { id: "history", icon: "▤", label: "Histórico" },
  { id: "profile", icon: "◎", label: "Perfil" }
];

export function MobilePwaShell({
  active,
  children,
  onTabChange
}: {
  active: MobileTab;
  children: ReactNode;
  onTabChange: (tab: MobileTab) => void;
}) {
  return (
    <section className={styles.shell} aria-label="Aplicação Doe Sangue Angola">
      <header className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.drop} aria-hidden="true" />
          <span>
            <strong>Doe Sangue Angola</strong>
            <small>Salve vidas com um gesto</small>
          </span>
        </div>
        <div className={styles.actions}>
          <NotificationBell />
          <Link className={appStyles.iconButton} href="/mobile/settings" aria-label="Definições">
            ⚙
          </Link>
        </div>
      </header>
      <div className={styles.content}>{children}</div>
      <nav className={styles.nav} aria-label="Navegação da aplicação móvel">
        {tabs.map((tab) => (
          <button
            aria-current={active === tab.id ? "page" : undefined}
            className={`${styles.navItem} ${active === tab.id ? styles.active : ""}`}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            <span aria-hidden="true">{tab.icon}</span>
            <small>{tab.label}</small>
          </button>
        ))}
      </nav>
    </section>
  );
}
