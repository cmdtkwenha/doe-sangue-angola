import { getDatabaseClient } from "../databaseService";
import { mapHospital, type HospitalRow } from "./databaseTypes";

export const hospitalRepository = {
  async listHospitals() {
    const { data, error } = await getDatabaseClient()
      .from("hospitals")
      .select("id,name,province,municipality,verified,capacity,contact")
      .order("name");

    if (error) throw error;
    return (data as unknown as HospitalRow[]).map(mapHospital);
  },

  async getHospital(id: string) {
    const { data, error } = await getDatabaseClient()
      .from("hospitals")
      .select("id,name,province,municipality,verified,capacity,contact")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapHospital(data as unknown as HospitalRow);
  }
};
