"use client";

import { useState } from "react";
import type { AvailabilityArea } from "./nationalTypes";
import styles from "./national.module.css";

export function BloodAvailabilityMap({
  municipalities,
  provinces
}: {
  municipalities: AvailabilityArea[];
  provinces: AvailabilityArea[];
}) {
  const [mode, setMode] = useState<"province" | "municipality">("province");
  const areas = mode === "province" ? provinces : municipalities;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Mapa de Disponibilidade</strong>
        <div className={styles.segmented}>
          <button className={mode === "province" ? styles.active : ""} onClick={() => setMode("province")} type="button">Província</button>
          <button className={mode === "municipality" ? styles.active : ""} onClick={() => setMode("municipality")} type="button">Município</button>
        </div>
      </div>
      <div className={styles.areaGrid}>
        {areas.map((area) => (
          <article className={`${styles.areaCard} ${styles[area.level]}`} key={area.name}>
            <strong>{area.name}</strong>
            <span>{area.requests} pedidos · {area.hospitals} hospitais</span>
            <small>{label(area.level)} · excedente {area.surplus}</small>
          </article>
        ))}
      </div>
      <div className={styles.legend}>
        <span className={styles.critical}>Escassez</span>
        <span className={styles.warning}>Atenção</span>
        <span className={styles.stable}>Estável</span>
        <span className={styles.surplus}>Excedente</span>
      </div>
    </section>
  );
}

function label(level: AvailabilityArea["level"]) {
  return {
    critical: "Crítico",
    stable: "Estável",
    surplus: "Excedente",
    warning: "Atenção"
  }[level];
}
