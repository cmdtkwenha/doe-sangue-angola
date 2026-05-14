import baseStyles from "./adminCore.module.css";
import mapStyles from "./heatmap.module.css";

const provinces = [
  ["Cabinda", "warning", "Alto"],
  ["Zaire", "stable", "Normal"],
  ["Uíge", "warning", "Alto"],
  ["Luanda", "critical", "Crítico"],
  ["Bengo", "warning", "Alto"],
  ["Cuanza Norte", "warning", "Alto"],
  ["Malanje", "critical", "Crítico"],
  ["Lunda Norte", "warning", "Baixo"],
  ["Benguela", "warning", "Médio"],
  ["Huambo", "stable", "Normal"],
  ["Bié", "warning", "Baixo"],
  ["Huíla", "stable", "Normal"],
  ["Cunene", "critical", "Crítico"],
  ["Moxico", "warning", "Médio"],
  ["Namibe", "warning", "Baixo"]
];

export function ProvinceHeatMap() {
  return (
    <section className={baseStyles.panel}>
      <div className={baseStyles.panelHead}>
        <strong>Mapa de Escassez por Província</strong>
        <span className="pill">Nível de escassez</span>
      </div>
      <div className={mapStyles.mapWrap}>
        <div className={mapStyles.mapGrid}>
          {provinces.map(([name, state, level]) => (
            <div className={`${mapStyles.province} ${mapStyles[state]}`} key={name}>
              {name}
              <br />
              <span>{level}</span>
            </div>
          ))}
        </div>
        <aside className={mapStyles.mapList}>
          <span className="pill red">Crítico</span>
          <span className="pill gold">Alto</span>
          <span className="pill">Normal</span>
          <p className="muted">Mapa operacional baseado em pedidos e estoque mockado.</p>
        </aside>
      </div>
    </section>
  );
}
