import { getDatabaseClient } from "../databaseService";
import { mapHospital, type HospitalRow } from "./databaseTypes";

const hospitalColumns = [
  "id",
  "address",
  "capacity",
  "contact",
  "email",
  "facility_type",
  "license_number",
  "municipality",
  "name",
  "province",
  "verified"
].join(",");

export const hospitalRepository = {
  async listHospitals() {
    const { data, error } = await getDatabaseClient()
      .from("hospitals")
      .select(hospitalColumns)
      .order("name");

    if (error) throw error;
    return (data as unknown as HospitalRow[]).map(mapHospital);
  },

  async getHospital(id: string) {
    const { data, error } = await getDatabaseClient()
      .from("hospitals")
      .select(hospitalColumns)
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapHospital(data as unknown as HospitalRow);
  },

  async findHospitalByUserId(userId: string) {
    const { data, error } = await getDatabaseClient()
      .from("hospitals")
      .select(hospitalColumns)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapHospital(data as unknown as HospitalRow) : null;
  },

  async assignHospitalUser(hospitalId: string, userId: string) {
    const { data, error } = await getDatabaseClient()
      .from("hospitals")
      .update({ user_id: userId })
      .eq("id", hospitalId)
      .eq("verified", true)
      .select(hospitalColumns)
      .single();

    if (error) throw error;
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
      .upsert(payload, { onConflict: "name,province" })
      .select(hospitalColumns);

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
