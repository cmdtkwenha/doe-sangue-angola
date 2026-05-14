import { getDatabaseClient } from "../databaseService";

export const auditRepository = {
  async createAuditLog(actor: string, action: string) {
    const { data, error } = await getDatabaseClient()
      .from("audit_logs")
      .insert({ actor_label: actor, action })
      .select("id,actor_label,action,created_at")
      .single();

    if (error) throw error;

    return {
      id: data.id,
      actor: data.actor_label,
      action: data.action,
      time: new Date(data.created_at).toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  }
};
