"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import baseStyles from "./adminCore.module.css";
import mapStyles from "./heatmap.module.css";

export function ProvinceHeatMap() {
  const version = useRealtimeVersion();
  const { data: requests, error, loading } = useApiData<BloodRequest[]>("/api/blood-requests", [], version);
  const provinces = buildProvinceStats(requests);

  return (
    <section className={baseStyles.panel}>
      <div className={baseStyles.panelHead}>
        <strong>Mapa de Escassez por Província</strong>
        <span className="pill">Nível de escassez</span>
      </div>
      <div className={mapStyles.mapWrap}>
        <div className={mapStyles.mapGrid}>
          {provinces.map(({ name, state, level, total }) => (
            <div className={`${mapStyles.province} ${mapStyles[state]}`} key={name}>
              {name}
              <br />
              <span>{level} · {total}</span>
            </div>
          ))}
        </div>
        <aside className={mapStyles.mapList}>
          <span className="pill red">Crítico</span>
          <span className="pill gold">Alto</span>
          <span className="pill">Normal</span>
          <p className="muted">
            {loading ? "A calcular províncias..." : error || "Baseado em pedidos reais Supabase."}
          </p>
        </aside>
      </div>
    </section>
  );
}

function buildProvinceStats(requests: BloodRequest[]) {
  const grouped = new Map<string, BloodRequest[]>();
  requests.forEach((request) => {
    const province = request.province ?? "Sem província";
    grouped.set(province, [...(grouped.get(province) ?? []), request]);
  });
  return Array.from(grouped.entries()).map(([name, items]) => {
    const critical = items.filter((item) => item.urgency === "Critica").length;
    const state = critical > 0 ? "critical" : items.length > 2 ? "warning" : "stable";
    const level = critical > 0 ? "Crítico" : items.length > 2 ? "Alto" : "Normal";
    return { level, name, state, total: items.length };
  });
}
