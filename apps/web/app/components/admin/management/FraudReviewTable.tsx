import { fraudActions } from "@constants/adminActions";
import { listFraudReviewQueue } from "@doe-sangue-angola/shared-services";
import { ManagementTable } from "./ManagementTable";

export function FraudReviewTable() {
  return (
    <ManagementTable
      title="Revisões de Fraude"
      exportName="fraude.csv"
      columns={["Caso", "Entidade", "Risco", "Score", "Sinais"]}
      rows={listFraudReviewQueue().map((item) => ({
        id: item.id,
        status: item.status,
        values: {
          Caso: item.id,
          Entidade: item.entity,
          Risco: item.risk,
          Score: String(item.score),
          Sinais: item.flags.join(" · ")
        },
        actions: fraudActions
      }))}
    />
  );
}
