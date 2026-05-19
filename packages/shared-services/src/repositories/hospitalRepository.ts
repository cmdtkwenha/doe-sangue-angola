import { getDatabaseClient } from "../databaseService";
import { mapHospital, type HospitalRow } from "./databaseTypes";

export const hospitalRepository = {
  async listHospitals() {
    const db = getDatabaseClient();
    const { data, error } = await db
      .from("hospitals")
      .select("*")
      .order("name");

    if (error) throw error;
    return (data as unknown as HospitalRow[]).map(mapHospital);
  },

  async getHospital(id: string) {
    const { data, error } = await getDatabaseClient()
      .from("hospitals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapHospital(data as unknown as HospitalRow);
  },

  async findHospitalByUserId(userId: string) {
    const { data, error } = await getDatabaseClient()
      .from("hospitals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapHospital(data as unknown as HospitalRow) : null;
  },

  async assignHospitalUser(hospitalId: string, userId: string) {
    const db = getDatabaseClient();
    const { data, error } = await db
      .from("hospitals")
      .update({ user_id: userId })
      .eq("id", hospitalId)
      .eq("verified", true)
      .select("*")
      .single();

    if (error) throw error;
    await db
      .from("profiles")
      .update({ linked_entity_id: hospitalId })
      .eq("id", userId);
    return mapHospital(data as unknown as HospitalRow);
  },

  async upsertHospitals(rows: HospitalImportRow[]) {
    const payload = rows.map((row) => ({
      address: row.address,
      contact: row.phone,
      email: row.email,
      facility_type: row.type,
      license_number: row.licenseNumber,
      municipality: row.municipality,
      name: row.name,
      province: row.province,
      verified: row.verified
    }));
    const { data, error } = await getDatabaseClient()
      .from("hospitals")
      .upsert(payload, { onConflict: "name,province,municipality" })
      .select("*");

    if (error) throw error;
    return (data as unknown as HospitalRow[]).map(mapHospital);
  }
};

export type HospitalImportRow = {
  address: string;
  email: string;
  licenseNumber: string;
  municipality: string;
  name: string;
  phone: string;
  province: string;
  type: string;
  verified: boolean;
};
