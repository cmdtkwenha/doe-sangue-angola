import styles from "./hospitalPortal.module.css";

const navItems = [
  "Painel Principal",
  "Pedidos de Sangue",
  "Solicitar Sangue",
  "Dadores Recebidos",
  "Agendamentos",
  "Inventário de Sangue",
  "Desempenho",
  "Relatórios",
  "Comunicações",
  "Equipas",
  "Perfil do Hospital",
  "Definições"
];

export function HospitalSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.drop} />
        <div>
          <strong>SANGUE ANGOLA</strong>
          <div style={{ color: "#ff4655", fontWeight: 800 }}>HOSPITAL</div>
        </div>
      </div>
      <nav aria-label="Navegação do hospital" className={styles.nav}>
        {navItems.map((item, index) => (
          <a
            aria-current={index === 0 ? "page" : undefined}
            className={`${styles.navItem} ${index === 0 ? styles.navItemActive : ""}`}
            href={item === "Definições" ? "/hospital/settings" : item === "Relatórios" ? "/hospital/reports" : "#"}
            key={item}
          >
            <span>{index === 2 ? "+" : "□"}</span>
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}
