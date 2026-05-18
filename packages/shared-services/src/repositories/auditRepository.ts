import { getDatabaseClient } from "../databaseService";

export const auditRepository = {
  async listAuditLogs() {
    const { data, error } = await getDatabaseClient()
      .from("audit_logs")
      .select("id,actor_label,action,created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(mapAuditLog);
  },

  async createAuditLog(actor: string, action: string) {
    const { data, error } = await getDatabaseClient()
      .from("audit_logs")
      .insert({ actor_label: actor, action })
      .select("id,actor_label,action,created_at")
      .single();

    if (error) throw error;

    return mapAuditLog(data);
  }
};

function mapAuditLog(row: {
  action: string;
  actor_label: string;
  created_at: string;
  id: string;
}) {
  return {
    id: row.id,
    actor: row.actor_label,
    action: row.action,
    time: new Date(row.created_at).toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };
}
