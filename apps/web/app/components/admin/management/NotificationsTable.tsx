import { notificationActions } from "@constants/adminActions";
import { communications } from "@doe-sangue-angola/shared-services";
import { ManagementTable } from "./ManagementTable";

export function NotificationsTable() {
  return (
    <ManagementTable
      title="Notificações"
      exportName="notificacoes.csv"
      columns={["Canal", "Destinatário", "Mensagem"]}
      rows={communications.map((item) => ({
        id: item.id,
        status: item.status,
        values: {
          Canal: item.channel,
          Destinatário: item.recipient,
          Mensagem: item.message
        },
        actions: notificationActions
      }))}
    />
  );
}
