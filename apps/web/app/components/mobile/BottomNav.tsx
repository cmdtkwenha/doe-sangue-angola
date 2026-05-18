import styles from "./mobileApp.module.css";

const items = [
  ["home", "⌂", "Início", "/mobile#home"],
  ["donations", "♢", "Doações", "/mobile#donations"],
  ["requests", "▣", "Pedidos", "/mobile#requests"],
  ["profile", "♙", "Perfil", "/mobile#profile"],
  ["settings", "⚙", "Definições", "/mobile/settings"]
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className={styles.nav} aria-label="Navegação mobile">
      {items.map(([id, icon, label, href]) => (
        <a
          className={`${styles.navItem} ${active === id ? styles.active : ""}`}
          href={href}
          key={id}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
