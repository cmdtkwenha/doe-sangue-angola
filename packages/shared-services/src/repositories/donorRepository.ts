import { getDatabaseClient } from "../databaseService";
import { mapDonor, type DonorRow } from "./databaseTypes";
import { rewardRepository } from "./rewardRepository";

const donorColumns = [
  "id",
  "blood_type",
  "province",
  "municipality",
  "available",
  "last_donation",
  "points",
  "preferred_hospital_id",
  "user_id",
  "users(name)"
].join(",");

export const donorRepository = {
  async listDonors() {
    const { data, error } = await getDatabaseClient()
      .from("donors")
      .select(donorColumns)
      .order("points", { ascending: false });

    if (error) throw error;
    return (data as unknown as DonorRow[]).map(mapDonor);
  },

  async findDonor(id: string) {
    const { data, error } = await getDatabaseClient()
      .from("donors")
      .select(donorColumns)
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapDonor(data as unknown as DonorRow);
  },

  async addRewardPoints(donorId: string, points: number) {
    const donor = await this.findDonor(donorId);
    const { error } = await getDatabaseClient()
      .from("donors")
      .update({ points: donor.points + points })
      .eq("id", donorId);

    if (error) throw error;
    await rewardRepository.createReward({
      donorId,
      points,
      reason: "Doação concluída"
    });
    return { ...donor, points: donor.points + points };
  }
};
