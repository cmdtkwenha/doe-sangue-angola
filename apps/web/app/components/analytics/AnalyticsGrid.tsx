import {
  adminTrends,
  bloodDemandShare,
  demandTrend,
  donationTrend,
  donorActivity,
  forecastTrend,
  fulfilmentTrend,
  hospitalTrends
} from "./analyticsData";
import styles from "./analytics.module.css";
import { LineChartCard } from "./LineChartCard";
import { PieChartCard } from "./PieChartCard";
import { ProvinceRankingChart } from "./ProvinceRankingChart";
import { TrendCard } from "./TrendCard";

export function AnalyticsGrid({ scope }: { scope: "admin" | "hospital" }) {
  const trends = scope === "admin" ? adminTrends : hospitalTrends;

  return (
    <section className={styles.grid}>
      {trends.map(([label, value, change, note]) => (
        <TrendCard label={label} note={`${change} · ${note}`} value={value} key={label} />
      ))}
      <LineChartCard area title="Tendência de procura por sangue" values={demandTrend} />
      <LineChartCard title="Tendência de doações" values={donationTrend} />
      <ProvinceRankingChart />
      <LineChartCard area title="Previsão de escassez" values={forecastTrend} />
      <PieChartCard items={bloodDemandShare} title="Distribuição por tipo" />
      <PieChartCard items={donorActivity} title="Atividade dos dadores" />
      <LineChartCard title="Cumprimento de pedidos" values={fulfilmentTrend} />
    </section>
  );
}
