import styles from "./adminAdvanced.module.css";

const stats = [
  ["Taxa de Atendimento", "87%", "6%"],
  ["Tempo Médio de Resposta", "28 min", "-12 min"],
  ["Doações Realizadas", "1.248", "15%"]
];

export function PerformanceChart() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Análise de Desempenho</strong>
        <span className="muted">Últimos 7 dias</span>
      </div>
      <div className={styles.advancedGrid}>
        {stats.map(([label, value, delta]) => (
          <div key={label}>
            <span className="muted">{label}</span>
            <h3 style={{ margin: "6px 0" }}>{value}</h3>
            <span className="pill">{delta}</span>
          </div>
        ))}
      </div>
      <svg className={styles.chart} viewBox="0 0 620 170">
        <polyline fill="none" points="20,65 115,72 210,78 305,60 400,44 495,86 600,58" stroke="#d01424" strokeWidth="5" />
        <polyline fill="none" points="20,104 115,108 210,122 305,106 400,76 495,112 600,84" stroke="#087443" strokeWidth="5" />
      </svg>
    </section>
  );
}
