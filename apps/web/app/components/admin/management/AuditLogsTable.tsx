import { listAuditLogs } from "@doe-sangue-angola/shared-services";
import { ManagementTable } from "./ManagementTable";

export function AuditLogsTable() {
  return (
    <ManagementTable
      title="Logs de Auditoria"
      exportName="auditoria.csv"
      columns={["Hora", "Ator", "Ação"]}
      rows={listAuditLogs().map((log) => ({
        id: log.id,
        status: "Registado",
        values: {
          Hora: log.time,
          Ator: log.actor,
          Ação: log.action
        },
        actions: ["Exportar relatório", "Ver detalhe"]
      }))}
    />
  );
}
