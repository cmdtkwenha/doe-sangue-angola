import { getDatabaseClient } from "../databaseService";
import { mapAppointment, type AppointmentRow } from "./databaseTypes";

const appointmentColumns = [
  "id",
  "donor_id",
  "hospital_id",
  "blood_request_id",
  "date",
  "time",
  "pin",
  "status"
].join(",");

export const appointmentRepository = {
  async listAppointments() {
    const { data, error } = await getDatabaseClient()
      .from("appointments")
      .select(appointmentColumns)
      .order("date", { ascending: true });

    if (error) throw error;
    return (data as unknown as AppointmentRow[]).map(mapAppointment);
  },

  async listAppointmentsForDonor(donorId: string) {
    const { data, error } = await getDatabaseClient()
      .from("appointments")
      .select(appointmentColumns)
      .eq("donor_id", donorId)
      .order("date", { ascending: true });

    if (error) throw error;
    return (data as unknown as AppointmentRow[]).map(mapAppointment);
  },

  async listAppointmentsForHospital(hospitalId: string) {
    const { data, error } = await getDatabaseClient()
      .from("appointments")
      .select(appointmentColumns)
      .eq("hospital_id", hospitalId)
      .order("date", { ascending: true });

    if (error) throw error;
    return (data as unknown as AppointmentRow[]).map(mapAppointment);
  }
};
