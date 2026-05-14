import styles from "./mobileApp.module.css";

const items = [
  ["home", "⌂", "Início"],
  ["donations", "♢", "Doações"],
  ["requests", "▣", "Pedidos"],
  ["profile", "♙", "Perfil"],
  ["settings", "⚙", "Definições"]
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className={styles.nav} aria-label="Navegação mobile">
      {items.map(([id, icon, label]) => (
        <a
          className={`${styles.navItem} ${active === id ? styles.active : ""}`}
          href={id === "settings" ? "/mobile/settings" : "#"}
          key={id}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
