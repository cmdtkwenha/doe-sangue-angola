import { getDatabaseClient } from "../databaseService";

export const rewardRepository = {
  async createReward(input: {
    donorId: string;
    points: number;
    reason: string;
    tier?: string;
  }) {
    const { data, error } = await getDatabaseClient()
      .from("rewards")
      .insert({
        donor_id: input.donorId,
        points: input.points,
        reason: input.reason,
        tier: input.tier
      })
      .select("id,donor_id,points,reason,tier,created_at")
      .single();

    if (error) throw error;
    return data;
  },

  async listRewardsForDonor(donorId: string) {
    const { data, error } = await getDatabaseClient()
      .from("rewards")
      .select("id,donor_id,points,reason,tier,created_at")
      .eq("donor_id", donorId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
};
