import { provinceRankings } from "./analyticsData";
import { BarChartCard } from "./BarChartCard";

export function ProvinceRankingChart() {
  return (
    <BarChartCard
      items={provinceRankings}
      title="Ranking de doações por província"
    />
  );
}
