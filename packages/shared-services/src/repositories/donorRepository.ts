import type { BloodType } from "@doe-sangue-angola/shared-types";
import { getDatabaseClient } from "../databaseService";
import { mapDonor, type DonorRow } from "./databaseTypes";
import { rewardRepository } from "./rewardRepository";

const donorColumns = [
  "id",
  "auth_user_id",
  "full_name",
  "email",
  "emergency_contact_name",
  "emergency_contact_phone",
  "phone",
  "blood_type",
  "province",
  "municipality",
  "gender",
  "available",
  "birth_date",
  "last_donation",
  "last_donation_date",
  "total_donations",
  "eligibility_status",
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
      .or(`auth_user_id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDonor(data as unknown as DonorRow) : null;
  },

  async upsertDonorProfile(input: DonorProfileInput) {
    const db = getDatabaseClient();
    const { error: userError } = await db
      .from("users")
      .update({ phone: input.phone, name: input.fullName })
      .eq("id", input.userId);

    if (userError) throw userError;
    const { data, error } = await db
      .from("donors")
      .upsert({
        auth_user_id: input.authUserId,
        email: input.email,
        full_name: input.fullName,
        phone: input.phone,
        user_id: input.userId,
        blood_type: input.bloodType,
        province: input.province,
        municipality: input.municipality,
        birth_date: input.birthDate || null,
        gender: input.gender || null,
        eligibility_status: input.eligibilityStatus ?? "Elegível",
        total_donations: input.totalDonations ?? 0,
        available: true
      }, { onConflict: input.authUserId ? "auth_user_id" : "user_id" })
      .select(donorColumns)
      .single();

    if (error) throw error;
    const donor = data as unknown as DonorRow;
    if (input.authUserId) {
      await db
        .from("profiles")
        .update({ linked_entity_id: donor.id })
        .eq("auth_user_id", input.authUserId);
    }
    return mapDonor(donor);
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
  authUserId?: string;
  birthDate: string;
  bloodType: BloodType;
  email?: string;
  eligibilityStatus?: string;
  fullName: string;
  gender?: string;
  municipality: string;
  phone: string;
  province: string;
  totalDonations?: number;
  userId: string;
};
