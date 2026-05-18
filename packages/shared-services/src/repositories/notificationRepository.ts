import { getDatabaseClient } from "../databaseService";
import { mapNotification } from "./databaseTypes";
import type { MockNotification, NotificationType } from "../notificationService";

export const notificationRepository = {
  async listNotifications(donorId: string) {
    const userId = await findUserIdForDonor(donorId);
    const { data, error } = await getDatabaseClient()
      .from("notifications")
      .select("id,user_id,title,body,type,read,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown[]).map((item) => mapNotification(item as never));
  },

  async createNotification(input: {
    donorId: string;
    title: string;
    body: string;
    type: NotificationType;
  }): Promise<MockNotification> {
    const userId = await findUserIdForDonor(input.donorId);
    const { data, error } = await getDatabaseClient()
      .from("notifications")
      .insert({
        user_id: userId,
        title: input.title,
        body: input.body,
        type: input.type,
        read: false
      })
      .select("id,user_id,title,body,type,read,created_at")
      .single();

    if (error) throw error;
    return mapNotification(data as never);
  },

  async markAllNotificationsRead(donorId: string) {
    const userId = await findUserIdForDonor(donorId);
    const { error } = await getDatabaseClient()
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  }
};

async function findUserIdForDonor(donorId: string) {
  const { data, error } = await getDatabaseClient()
    .from("donors")
    .select("user_id")
    .eq("id", donorId)
    .single();

  if (error) throw error;
  if (!data.user_id) throw new Error("Dador sem utilizador associado.");
  return data.user_id as string;
}
