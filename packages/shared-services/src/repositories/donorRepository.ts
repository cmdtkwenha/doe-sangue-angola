import type { BloodType } from "@doe-sangue-angola/shared-types";
import { getDatabaseClient } from "../databaseService";
import { mapDonor, type DonorRow } from "./databaseTypes";
import { rewardRepository } from "./rewardRepository";

const donorColumns = [
  "id",
  "blood_type",
  "province",
  "municipality",
  "available",
  "birth_date",
  "last_donation",
  "points",
  "preferred_hospital_id",
  "user_id",
  "users(name,phone)"
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

  async findDonorByUserId(userId: string) {
    const { data, error } = await getDatabaseClient()
      .from("donors")
      .select(donorColumns)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDonor(data as unknown as DonorRow) : null;
  },

  async upsertDonorProfile(input: DonorProfileInput) {
    const db = getDatabaseClient();
    const { error: userError } = await db
      .from("users")
      .update({ phone: input.phone })
      .eq("id", input.userId);

    if (userError) throw userError;
    const { data, error } = await db
      .from("donors")
      .upsert({
        user_id: input.userId,
        blood_type: input.bloodType,
        province: input.province,
        municipality: input.municipality,
        birth_date: input.birthDate || null,
        available: true
      }, { onConflict: "user_id" })
      .select(donorColumns)
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

export type DonorProfileInput = {
  birthDate: string;
  bloodType: BloodType;
  municipality: string;
  phone: string;
  province: string;
  userId: string;
};
