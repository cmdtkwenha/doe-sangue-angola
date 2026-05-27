"use client";

import { useApiData } from "@hooks/useApiData";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import type { RealNotification } from "../../notifications/types";
import { ManagementTable } from "./ManagementTable";

export function NotificationsTable() {
  const liveVersion = useSupabaseRealtimeVersion(["notifications"]);
  const { data } = useApiData<RealNotification[]>("/api/notifications?all=true", [], liveVersion);
  return (
    <ManagementTable
      title="Notificações"
      exportName="notificacoes.csv"
      columns={["Perfil", "Título", "Mensagem", "Estado"]}
      rows={data.map((item) => ({
        id: item.id,
        status: item.read ? "Lida" : "Por ler",
        values: {
          Estado: item.read ? "Lida" : "Por ler",
          Mensagem: item.message,
          Perfil: item.role,
          Título: item.title
        },
        actions: ["Ver"]
      }))}
    />
  );
}
