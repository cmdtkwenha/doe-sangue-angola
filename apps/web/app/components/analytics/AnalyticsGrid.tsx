"use client";

import type { BloodRequest, Donor, Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../ui/EmptyState";
import styles from "./analytics.module.css";
import { BarChartCard } from "./BarChartCard";
import { TrendCard } from "./TrendCard";

export function AnalyticsGrid({ scope }: { scope: "admin" | "hospital" }) {
  const { data: donors } = useApiData<Donor[]>("/api/donors", []);
  const { data: hospitals } = useApiData<Hospital[]>("/api/hospitals", []);
  const { data: requests } = useApiData<BloodRequest[]>("/api/blood-requests", []);
  const completed = requests.filter((request) => ["Concluído", "Concluido"].includes(request.status));
  const active = requests.filter((request) => !["Cancelado", "Concluído", "Concluido"].includes(request.status));
  const provinceItems = Array.from(groupByProvince(requests)).sort((a, b) => b[1] - a[1]);
  const hasData = donors.length > 0 || hospitals.length > 0 || requests.length > 0;

  if (!hasData) {
    return (
      <section className={styles.grid}>
        <EmptyState
          title="Sem analítica real"
          message="Os gráficos aparecem quando houver dados piloto em Supabase."
        />
      </section>
    );
  }

  return (
    <section className={styles.grid}>
      <TrendCard label="Pedidos ativos" note="Supabase" value={String(active.length)} />
      <TrendCard label="Doações concluídas" note="Supabase" value={String(completed.length)} />
      <TrendCard label="Dadores registados" note="Supabase" value={String(donors.length)} />
      <TrendCard label="Hospitais verificados" note={scopeLabel(scope)} value={String(hospitals.filter((item) => item.verified).length)} />
      {provinceItems.length ? (
        <BarChartCard items={provinceItems} title="Pedidos por província" />
      ) : (
        <EmptyState title="Sem pedidos por província" message="Crie pedidos reais para gerar rankings." />
      )}
    </section>
  );
}

function groupByProvince(requests: BloodRequest[]) {
  const totals = new Map<string, number>();
  requests.forEach((request) => {
    const province = request.province ?? "Sem província";
    totals.set(province, (totals.get(province) ?? 0) + 1);
  });
  return totals;
}

function scopeLabel(scope: "admin" | "hospital") {
  return scope === "admin" ? "Nacional" : "Hospital";
}
