import { schedulingAgent } from "@doe-sangue-angola/agents";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { getDatabaseClient } from "../databaseService";
import { donorRepository } from "./donorRepository";
import { hospitalRepository } from "./hospitalRepository";
import { mapAppointment, mapRequest, type AppointmentRow, type RequestRow } from "./databaseTypes";

type CreateRequestInput = Omit<BloodRequest, "createdAt" | "id" | "status">;

export const requestRepository = {
  async listRequests() {
    const { data, error } = await getDatabaseClient()
      .from("blood_requests")
      .select(requestColumns)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as RequestRow[]).map(mapRequest);
  },

  async listRequestsForHospital(hospitalId: string) {
    const { data, error } = await getDatabaseClient()
      .from("blood_requests")
      .select(requestColumns)
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as RequestRow[]).map(mapRequest);
  },

  async createRequest(input: CreateRequestInput) {
    const { data, error } = await getDatabaseClient()
      .from("blood_requests")
      .insert({
        hospital_id: input.hospitalId,
        patient_code: input.patientCode,
        blood_type: input.bloodType,
        units: input.units,
        urgency: input.urgency,
        status: "Aberto"
      })
      .select(requestColumns)
      .single();

    if (error) throw error;
    return mapRequest(data as unknown as RequestRow);
  },

  async updateRequestStatus(id: string, status: BloodRequest["status"]) {
    const { data, error } = await getDatabaseClient()
      .from("blood_requests")
      .update({ status })
      .eq("id", id)
      .select(requestColumns)
      .single();

    if (error) throw error;
    return mapRequest(data as unknown as RequestRow);
  },

  async completeRequest(donorId: string, requestId: string) {
    const { error } = await getDatabaseClient()
      .from("appointments")
      .update({ status: "Concluido" })
      .eq("donor_id", donorId)
      .eq("blood_request_id", requestId);
    if (error) throw error;

    await donorRepository.addRewardPoints(donorId, 120);
    return this.updateRequestStatus(requestId, "Concluído");
  },

  async acceptRequest(donorId: string, requestId: string) {
    const request = await findRequest(requestId);
    const donor = await donorRepository.findDonor(donorId);
    const hospital = await hospitalRepository.getHospital(request.hospitalId);
    const appointment = schedulingAgent(donor, hospital);

    const { data, error } = await getDatabaseClient()
      .from("appointments")
      .insert({
        donor_id: donorId,
        hospital_id: request.hospitalId,
        blood_request_id: requestId,
        date: appointment.date,
        time: appointment.time,
        pin: appointment.pin,
        status: "Pendente"
      })
      .select("id,donor_id,hospital_id,blood_request_id,date,time,pin,status")
      .single();

    if (error) throw error;
    await this.updateRequestStatus(requestId, "Agendado");

    return mapAppointment(data as unknown as AppointmentRow);
  },

  async validatePin(pin: string) {
    const { data, error } = await getDatabaseClient()
      .from("appointments")
      .update({ status: "Confirmado" })
      .eq("pin", pin)
      .select("id,donor_id,hospital_id,date,time,pin,status,blood_request_id")
      .single();

    if (error) throw error;
    if (data.blood_request_id) {
      await this.updateRequestStatus(data.blood_request_id, "PIN Validado");
    }

    return mapAppointment(data as unknown as AppointmentRow);
  }
};

const requestColumns = [
  "id",
  "hospital_id",
  "patient_code",
  "blood_type",
  "units",
  "urgency",
  "status",
  "created_at"
].join(",");

async function findRequest(id: string) {
  const { data, error } = await getDatabaseClient()
    .from("blood_requests")
    .select(requestColumns)
    .eq("id", id)
    .single();

  if (error) throw error;
  return mapRequest(data as unknown as RequestRow);
}
